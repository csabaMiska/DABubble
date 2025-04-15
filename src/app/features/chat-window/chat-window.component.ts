import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { combineLatest, Observable, of, switchMap, take } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Message } from '../../shared/interface/message.model';
import { ChatComponent } from './chat/chat.component';
import { MessageInputFieldComponent } from '../message-input-field/message-input-field.component';
import { MessageInfoComponent } from '../message-info/message-info.component';
import { MessageService } from '../../shared/services/message/message.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ChatComponent,
    MessageInputFieldComponent,
    MessageInfoComponent
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements OnInit {
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  readonly dialog = inject(MatDialog);
  private profilePopupDialogRef?: MatDialogRef<ProfilePopupComponent>;

  user$!: Observable<User | undefined>;
  chatData$!: Observable<Message[]>;
  showUserProfile: boolean = true;

  ngOnInit(): void {
    this.getUserData();
    this.getChatData();
  }

  getUserData() {
    this.user$ = this.messageService.userIdOrChannelId$.pipe(
      switchMap(uid => this.firebaseUserService.getUserRealTime(uid))
    );
  }

  getChatData() {
    this.chatData$ = combineLatest([
      this.firebaseAuthService.getCurrentUser(),                         
      this.messageService.userIdOrChannelId$
    ]).pipe(
      switchMap(([currentUser, receiverId]) => {
        const senderId = currentUser?.uid;
        if (senderId && receiverId) {
          return this.chatService.getMessages(senderId, receiverId);
        } else {
          return of([]);
        }
      })
    );
  }
  

  onMessageReceived(message: string) {
    this.sendMessage(message);
  }

  sendMessage(message: string): void {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.messageService.userIdOrChannelId$
    ])
      .pipe(take(1))
      .subscribe(([user, receiverId]) => {
        if (user && receiverId) {
          const newMessage: Partial<Message> = {
            messageFrom: 'chats',
            senderId: user.uid,
            receiverId,
            timestamp: new Date().toISOString(),
            content: message,
          };
          this.chatService.sendMessage(user.uid, receiverId, newMessage);
        } else {
          console.error('User or receiver ID is undefined');
        }
      });
  }

  openProfileDialog(uid: string) {
    this.messageService.setUserIdOrChannelId(uid);
    this.profilePopupDialogRef = this.dialog.open(ProfilePopupComponent, {
      autoFocus: false,
      hasBackdrop: true,
      data: this.showUserProfile
    });
  }
}