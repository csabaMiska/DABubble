import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../../shared/interface/channal.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChannelNameValidatorDirective } from '../../../shared/directives/channel-name-validator/channel-name-validator.directive';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { combineLatest, EMPTY, filter, Observable, switchMap, take } from 'rxjs';
import { User } from '../../../shared/interface/user.model';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ProfilePopupComponent } from '../../profile-popup/profile-popup.component';
import { MessageService } from '../../../shared/services/message/message.service';
import { ConfirmDialogComponent } from '../../../core/confirm-dialog/confirm-dialog.component';
import { OverlayService } from '../../../shared/services/overlay/overlay.service';

@Component({
  selector: 'app-channel-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ChannelNameValidatorDirective
  ],
  templateUrl: './channel-info-dialog.component.html',
  styleUrl: './channel-info-dialog.component.scss'
})
export class ChannelInfoDialogComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly channelInfoDialog = inject(MatDialogRef<ChannelInfoDialogComponent>);
  private fb = inject(FormBuilder);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private overlayService = inject(OverlayService);

  channelId!: string;
  channel$!: Observable<Channel>;
  creator$!: Observable<User>;
  isCreator!: boolean;
  editChannelForm: FormGroup;
  editChannelName: boolean = false;
  editChannelDescription: boolean = false;
  showUserProfile: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { channelId: string }) {
    this.channelId = data.channelId;
    this.editChannelForm = this.fb.group({
      channel: [``, {
        validators: [Validators.required, Validators.minLength(2)],
        asyncValidators: [],
        updateOn: 'change'
      }],
      description: [``]
    });
  }

  ngOnInit(): void {
    this.getChannelData();
    this.updateEditFormValue();
    this.getChannelCreatorData();
    this.checkUserUidWithCreaterUid();
  }

  getChannelData() {
    this.channel$ = this.channelService.getChannelById(this.channelId);
  }

  getChannelCreatorData() {
    this.creator$ = this.channel$.pipe(
      switchMap(channel => {
        if (channel) {
          const creatorUid = channel.creatorUid;
          return this.firebaseUserService.getUserRealTime(creatorUid);
        }
        return EMPTY;
      }),
      filter((user): user is User => user !== undefined)
    );
  }

  checkUserUidWithCreaterUid() {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.channel$
    ])
      .pipe(
        take(1),
        filter(([user, channel]) => !!user && !!channel)
      )
      .subscribe(([user, channel]) => {
        this.isCreator = user!.uid === channel!.creatorUid;
      });
  }

  updateEditFormValue() {
    this.channel$.subscribe(channel => {
      if (channel) {
        this.editChannelForm.patchValue({
          channel: channel.title,
          description: channel.description
        });
      }
    });
  }

  closeDialog() {
    this.channelInfoDialog.close();
  }

  toggleChannelNameEdit(channelId: string) {
    if (!this.editChannelName) {
      this.editChannelName = true;
    } else {
      this.updateChannel(channelId);
      this.editChannelName = false;
    }
  }

  toggleChannelDescriptionEdit(channelId: string) {
    if (!this.editChannelDescription) {
      this.editChannelDescription = true;
    } else {
      this.updateChannel(channelId);
      this.editChannelDescription = false;
    }
  }

  updateChannel(channalId: string) {
    const newChannelData: Partial<Channel> = {
      title: this.editChannelForm.value.channel,
      description: this.editChannelForm.value.description
    };
    this.channelService.updateChannel(channalId, newChannelData);
  }

  deleteChannel(channelId: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      hasBackdrop: true,
      data: { messageIdOrChannelId: channelId, isMessage: false },
    });
    this.closeDialog();
  }

  leaveChannel(channelId: string) {
    this.firebaseAuthService.getCurrentUser().pipe(
      take(1),
    ).subscribe(user => {
      if (!user) return;
      this.channelService.removeUserFromChannel(channelId, user.uid)
        .subscribe({
          next: () => {
            this.overlayService.showOverlay('Du hast den Channel verlassen.', true, 'logout');
            this.closeDialog();
          },
          error: (error) => {
            console.error('Hiba a channel elhagyásakor:', error);
          }
        });
    });
  }

  openProfileDialog(userUid: string) {
    this.messageService.setUserIdOrChannelId(userUid);
    const profilePopupDialogRef = this.dialog.open(ProfilePopupComponent, {
      autoFocus: false,
      hasBackdrop: true,
      data: this.showUserProfile
    });
  }
}
