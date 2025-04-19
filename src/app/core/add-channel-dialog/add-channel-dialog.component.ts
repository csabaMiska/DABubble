import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OverlayService } from '../../shared/services/overlay/overlay.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Channel } from '../../shared/interface/channal.model';
import { Observable } from 'rxjs';
import { ChannelNameValidatorDirective } from '../../shared/directives/channel-name-validator/channel-name-validator.directive';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ChannelNameValidatorDirective
  ],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss'
})
export class AddChannelDialogComponent {
  readonly dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private overlayService = inject(OverlayService);
  private channelService = inject(ChannelService);
  private firebaseAuthService = inject(FirebaseAuthService);

  addChannelForm: FormGroup;

  constructor() {
    this.addChannelForm = this.fb.group({
      channel: ['', {
        validators: [Validators.required, Validators.minLength(2)],
        asyncValidators: [],
        updateOn: 'change'
      }],
      description: ['']
    });
  }

  addChannel() {
    this.closeAddChannelDialog();
    this.createChannel();
  }

  createChannel() {
    this.firebaseAuthService.getCurrentUser().subscribe(user => {
      if (user) {
        const userUid = user.uid;
        const channelTitle = this.addChannelForm.value.channel;
        const channelId = this.generateChannelId(channelTitle);

        const newChannel: Partial<Channel> = {
          type: 'Channel',
          title: this.addChannelForm.value.channel,
          description: this.addChannelForm.value.description,
          creatorUid: userUid,
          members: {
            [userUid]: { role: 'creator' }
          }
        }

        this.channelService.createChannel(newChannel, channelId);
        this.openAddUserDialog(channelId, userUid, channelTitle);
        this.overlayService.showOverlay(
          `${newChannel.title} created.`, true, 'workspaces'
        );
      } else {
        console.error('User not authenticated');
      }
    });
  }

  generateChannelId(channelName: string): string {
    return channelName.trim().toLowerCase().replace(/\s+/g, '_');
  }

  closeAddChannelDialog() {
    this.dialog.closeAll();
  }

  openAddUserDialog(channelId: string, creatorUid: string, channelTitle: string) {
    this.dialog.open(AddUserDialogComponent, {
      width: '100vw',
      maxWidth: '710px',
      minHeight: '279px',
      autoFocus: true,
      hasBackdrop: true,
      data: { channelId, creatorUid, channelTitle }
    });
  }
}
