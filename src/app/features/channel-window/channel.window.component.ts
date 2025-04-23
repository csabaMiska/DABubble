import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { Channel } from '../../shared/interface/channal.model';
import { MessageService } from '../../shared/services/message/message.service';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { User } from '../../shared/interface/user.model';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { MessageInputFieldComponent } from '../message-input-field/message-input-field.component';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Message } from '../../shared/interface/message.model';
import { ChannelComponent } from './channel/channel.component';
import { MessageInfoComponent } from '../message-info/message-info.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelInfoDialogComponent } from './channel-info-dialog/channel-info-dialog.component';
import { ChannelUsersListDialogComponent } from './channel-users-list-dialog/channel-users-list-dialog.component';

@Component({
  selector: 'app-channel-window',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MessageInputFieldComponent,
    ChannelComponent,
    MessageInfoComponent
  ],
  templateUrl: './channel-window.component.html',
  styleUrl: './channel-window.component.scss'
})
export class ChannelWindowComponent implements OnInit {
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  readonly dialog = inject(MatDialog);

  channel$!: Observable<Channel | undefined>;
  channelMembers$!: Observable<User[]>;
  chatData$!: Observable<Message[]>;
  buttonRects!: DOMRect;

  ngOnInit(): void {
    this.getChannelData();
    this.getChannelMembers();
    this.setChannelMembers();
    this.getChatData();
    this.getAllUsers();
  }

  getAllUsers() {
    this.channelService.users$ = this.firebaseUserService.getUsers();
  }

  getChannelData() {
    this.channel$ = this.messageService.userIdOrChannelId$.pipe(
      switchMap(channelId => this.channelService.getChannelById(channelId))
    );
  }

  getChannelMembers() {
    this.channelService.channelMembers$ = this.channel$.pipe(
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

  setChannelMembers() {
    this.channelMembers$ = this.channelService.channelMembers$;
  }

  getChatData() {
    this.chatData$ = this.messageService.userIdOrChannelId$
      .pipe(
        switchMap((channalId) => {
          if (channalId) {
            return this.channelService.getChannelMessages(channalId);
          } else {
            return of([]);
          }
        })
      );
  }

  onMessageReceived(message: string) {
    this.addMessage(message);
  }

  addMessage(message: string) {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.messageService.userIdOrChannelId$
    ])
      .pipe(take(1))
      .subscribe(([user, channalId]) => {
        if (user && channalId) {
          const newMessage: Partial<Message> = {
            messageFrom: 'channels',
            senderId: user.uid,
            receiverId: channalId,
            timestamp: new Date().toISOString(),
            content: message,
          };
          this.channelService.addMessageToChannel(channalId, newMessage);
        } else {
          console.error('User or  channelId is undefined');
        }
      });
  }

  openChannelInfoDialog($event: MouseEvent, channelId: string) {
    const rect = ($event.currentTarget as HTMLElement).getBoundingClientRect();
    this.buttonRects = rect;

    const dialogRef = this.dialog.open(ChannelInfoDialogComponent, {
      position: {
        top: `${this.buttonRects.top + 40}px`,
        left: `${this.buttonRects.left}px`,
      },
      width: '100vw',
      maxWidth: '872px',
      height: '100vh',
      maxHeight: '616px',
      data:{ channelId },
    });
  }

  openChannelUsersListDialog($event: MouseEvent, channelId: string, addUsersMode: boolean) {
    const rect = ($event.currentTarget as HTMLElement).getBoundingClientRect();
    this.buttonRects = rect;

    const dialogRef = this.dialog.open(ChannelUsersListDialogComponent, {
      position: {
        top: `${this.buttonRects.top + 44}px`,
        left: `${this.buttonRects.right - 415}px`,
      },
      width: '100vw',
      maxWidth: '415px',
      height: 'fit-content',
      maxHeight: '630px',
      data:{ channelId, addUsersMode },
    });
  }
}
