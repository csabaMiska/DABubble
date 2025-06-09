import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { User } from '../../../shared/interface/user.model';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { Channel } from '../../../shared/interface/channal.model';
import { UserCardComponent } from '../../user-card/user-card.component';
import { AddUserInputComponent } from '../add-user-input/add-user-input.component';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    AddUserInputComponent
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent {
  readonly dialog = inject(MatDialog);
  private firebaseUserService = inject(FirebaseUserService);
  private channelService = inject(ChannelService);

  selectedRadioValue: string = '1';
  showAddUsersInput: boolean = false;

  channelId!: string;
  creatorUid!: string;
  channelTitle!: string;
  allUsers: string[] = [];
  selectedUsers: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { channelId: string, creatorUid: string, channelTitle: string }) {
    this.channelId = data.channelId;
    this.creatorUid = data.creatorUid;
    this.channelTitle = data.channelTitle;
    this.getSelectedUsers();
  }

  getSelectedUsers() {
    this.channelService.selectedUsers$.subscribe(users => {
      this.selectedUsers = users;
    });
  }

  onRadioChange(event: MatRadioChange) {
    this.showAddUsersInput = this.selectedRadioValue === '2';
  }

  closeAddUserDialog() {
    this.dialog.closeAll();
  }

  addUsersToChannel() {
    if (this.selectedRadioValue === '1') {
      this.addAllUsersToChannel();
      this.closeAddUserDialog();
    } else if (this.selectedRadioValue === '2') {
      this.addSelectedUsersToChannel();
      this.closeAddUserDialog();
    }
  }

  addAllUsersToChannel() {
    this.firebaseUserService.getUsers().subscribe(users => {
      const allUsers = users.map(user => user.uid);
      const nonCreatorUsers = allUsers.filter(uid => uid !== this.creatorUid);
      const membersToAdd: { [uid: string]: { role: 'member' } } = {};

      nonCreatorUsers.forEach(uid => {
        membersToAdd[uid] = { role: 'member' };
      });

      this.channelService.addUserToChannel(this.channelId, {
        members: membersToAdd
      });
    });
  }

  addSelectedUsersToChannel() {
    const currentSelected = this.channelService.selectedUsers$.value;
    const membersToAdd: { [uid: string]: { role: 'member' } } = {};

    currentSelected.forEach(uid => {
      membersToAdd[uid] = { role: 'member' };
    });

    this.channelService.addUserToChannel(this.channelId, {
      members: membersToAdd
    });

    this.channelService.selectedUsers$.next([]);
  }
}
