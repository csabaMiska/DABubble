import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserCardComponent } from '../../../core/user-card/user-card.component';
import { combineLatest, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { Channel } from '../../../shared/interface/channal.model';
import { User } from '../../../shared/interface/user.model';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { AddUserInputComponent } from '../../../core/add-channel-dialog/add-user-input/add-user-input.component';

@Component({
  selector: 'app-channel-users-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    UserCardComponent,
    AddUserInputComponent
  ],
  templateUrl: './channel-users-list-dialog.component.html',
  styleUrl: './channel-users-list-dialog.component.scss'
})
export class ChannelUsersListDialogComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly channelUsersListDialog = inject(MatDialogRef<ChannelUsersListDialogComponent>);
  private channelService = inject(ChannelService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);

  channelId: string;
  addUsersMode: boolean;
  channel$!: Observable<Channel | undefined>;
  channelMembers$!: Observable<User[]>;
  selectedUsers: string[] = [];
  isCreator!: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { channelId: string, addUsersMode: boolean }) {
    this.channelId = data.channelId;
    this.addUsersMode = data.addUsersMode;
  }

  ngOnInit(): void {
    this.getChannelData();
    this.getChannelMembers();
    this.checkUserUidWithCreaterUid();
    this.getSelectedUsers();
  }

  getChannelData() {
    this.channel$ = this.channelService.getChannelById(this.channelId);
  }

  getChannelMembers() {
    this.channelMembers$ = this.channel$.pipe(
      switchMap(channel => {
        if (!channel || !channel.members) return of([]);
        const members = channel.members;
        const memberUids = Object.keys(members);
        const userObservables = memberUids.map(uid =>
          this.firebaseUserService.getUserRealTime(uid).pipe(
            map(user => user ? { ...user, role: members[uid].role } : null)
          )
        );
        return combineLatest(userObservables);
      }),
      map(users =>
        (users.filter(Boolean) as (User & { role: 'creator' | 'member' })[])
          .sort((a, b) => a.role === 'creator' ? -1 : 1)
      )
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

  removeSelectedUserFromChannel(userUid: string) {
    this.channelService.removeUserFromChannel(this.channelId, userUid);
  }

  showAddUsersMode() {
    this.addUsersMode = !this.addUsersMode;
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
    this.closeDialog();
  }

  getSelectedUsers() {
    this.channelService.selectedUsers$.subscribe(users => {
      this.selectedUsers = users;
    });
  }

  closeDialog() {
    this.channelUsersListDialog.close();
  }
}
