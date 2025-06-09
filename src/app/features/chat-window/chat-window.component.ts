import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { combineLatest, Observable, of, switchMap, take, tap } from 'rxjs';
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
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollService } from '../../shared/services/scroll-service/scroll-service';
import { MessageData } from '../../shared/interface/message-data.model';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ChatComponent,
    MessageInputFieldComponent,
    MessageInfoComponent,
    MatProgressSpinnerModule
  ],
  providers: [WindowWidthDirective],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements OnInit {
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private chatService = inject(ChatService);
  private channelService = inject(ChannelService);
  private windowWidthDirective = inject(WindowWidthDirective);
  private scrollService = inject(ScrollService);

  readonly dialog = inject(MatDialog);
  private profilePopupDialogRef?: MatDialogRef<ProfilePopupComponent>;
  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;


  user$!: Observable<User | undefined>;
  chatData$!: Observable<Message[]>;
  showUserProfile: boolean = true;
  chatIsLoading!: boolean;

  ngOnInit(): void {
    this.getUserData();
    this.getChatData();
  }

  getUserData() {
    this.chatIsLoading = true;
    this.user$ = this.channelService.userIdOrChannelId$.pipe(
      switchMap(uid => this.firebaseUserService.getUserRealTime(uid))
    );
  }

  getChatData() {
    this.chatData$ = combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.channelService.userIdOrChannelId$
    ]).pipe(
      switchMap(([currentUser, receiverId]) => {
        const senderId = currentUser?.uid;
        if (senderId && receiverId) {
          return this.chatService.getMessages(senderId, receiverId).pipe(
            tap(() => {
              this.chatIsLoading = false;
            })
          );
        } else {
          this.chatIsLoading = false;
          return of([]);
        }
      })
    );
  }


  onMessageReceived(messageData: MessageData) {
    this.addMessage(messageData);
  }

  addMessage(messageData: MessageData): void {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.channelService.userIdOrChannelId$
    ])
      .pipe(take(1))
      .subscribe(([user, receiverId]) => {
        if (user && receiverId) {
          const newMessage: Partial<Message> = {
            messageFrom: 'chats',
            senderId: user.uid,
            receiverId,
            timestamp: new Date().toISOString(),
            content: messageData,
          };
          this.chatService.sendMessage(user.uid, receiverId, newMessage);
          setTimeout(() => {
            this.scrollService.scrollToBottom(this.scrollContainerRef);
          }, 100);
        } else {
          console.error('User or receiver ID is undefined');
        }
      });
  }

  openProfileDialog(uid: string) {
    this.firebaseUserService.setUserIdToShowProfile(uid);
    this.firebaseAuthService.getCurrentUser().pipe(
      take(1)
    ).subscribe(currentUser => {
      const isOwnProfile = currentUser?.uid === uid;
      this.profilePopupDialogRef = this.dialog.open(ProfilePopupComponent, {
        position: isOwnProfile ? { top: '126px', right: '20px' } : undefined,
        data: isOwnProfile ? undefined : this.showUserProfile,
        autoFocus: false,
        hasBackdrop: true,
      });
    });
  }
}