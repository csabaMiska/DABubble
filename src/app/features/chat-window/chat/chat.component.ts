import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ChatService } from '../../../shared/services/firebase/chat/chat.service';
import { combineLatest, filter, map, Observable, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { MessageContentComponent } from '../../message-content/message-content.component';
import { MessageTimestampComponent } from '../../message-timestamp/message-timestamp.component';
import { MessageEditComponent } from '../../message-edit/message-edit.component';
import { MessageService } from '../../../shared/services/message/message.service';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MessageContentComponent,
    MessageTimestampComponent,
    MessageEditComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  messagesWithUserData$!: Observable<Array<Message & { senderData?: any }>>;
  messagesWithUserDataArray: Array<Message & { senderData?: any }> = [];
  sortedReactions: { [key: string]: any } = {};

  messageEditMode: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.getMessagesDate();
    this.convertMessegeData();
    this.getReactions();
    this.checkMessageEditMode();
    this.deleteMessage();
  }

  getMessagesDate() {
    this.messagesWithUserData$ = combineLatest([
      this.getCurrentUserUid(),
      this.chatService.receiverUid$
    ]).pipe(
      switchMap(([senderId, receiverId]) => {
        if (senderId && receiverId) {
          return this.getMessagesWithUserData(senderId, receiverId);
        } else {
          return of([]);
        }
      })
    );
  }

  convertMessegeData() {
    this.messagesWithUserData$.subscribe(messages => {
      this.messagesWithUserDataArray = messages;
    });
  }

  getCurrentUserUid() {
    return this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => (user ? [user.uid] : []))
    );
  }

  checkMessageEditMode() {
    this.messageService.messageEditMode$.subscribe(messageId => {
      this.messageEditMode = {};
      if (messageId) {
        this.messageEditMode[messageId] = true;
      }
    });
  }

  getMessagesWithUserData(senderId: string, receiverId: string) {
    return this.chatService.getMessages(senderId, receiverId).pipe(
      switchMap(messages => {
        if (messages.length === 0) return of([]);
        return this.enrichMessagesWithUserData(messages, senderId);
      })
    );
  }

  enrichMessagesWithUserData(messages: any[], senderId: string) {
    const uniqueSenderIds = [...new Set(messages.map(m => m.senderId))];
    return combineLatest([
      of(messages),
      combineLatest(uniqueSenderIds.map(uid =>
        this.firebaseUserService.getUserRealTime(uid)
      ))
    ]).pipe(
      map(([msgs, userData]) => {
        return msgs.map(message => ({
          ...message,
          senderData: userData.find(user => user!.uid === message.senderId),
          isSender: message.senderId === senderId
        }));
      })
    )
  }

  getReactions() {
    this.messagesWithUserData$.subscribe(messages => {
      const reactionsMap: { [key: string]: any } = {};

      messages.forEach(message => {
        const messageId = message.messageId;
        this.chatService.subscribeToReactions(message.senderId, message.receiverId, messageId);

        this.chatService.reactions$.subscribe(reactions => {
          reactionsMap[messageId] = reactions[messageId] || [];
        });
      });

      this.sortedReactions = reactionsMap;
    });
  }

  shouldShowTimestamp(message: Message, index: number): boolean {
    if (index === 0) return true;
    const currentTimestamp = this.convertToDate(message.timestamp);
    const previousMessage = this.messagesWithUserDataArray[index - 1];
    if (!previousMessage) return true;
    const previousTimestamp = this.convertToDate(previousMessage.timestamp);
    return currentTimestamp.toDateString() !== previousTimestamp.toDateString();
  }

  convertToDate(timestamp: any): Date {
    if (!timestamp) return new Date(0);
    if (timestamp.toDate) return timestamp.toDate();
    if (typeof timestamp === "number") return new Date(timestamp);
    return new Date(timestamp);
  }

  updateMessage(event: { messageId: string; message: string }) {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.chatService.receiverUid$
    ])
      .pipe(take(1))
      .subscribe(([user, receiverId]) => {
        if (user && receiverId) {
          this.chatService.updateMessage(user.uid, receiverId, event.messageId, { content: event.message });
        } else {
          console.error('User or receiver ID is undefined');
        }
      });
  }

  deleteMessage() {
    combineLatest([
      this.messageService.deleteMessageId$,
      this.firebaseAuthService.getCurrentUser(),
      this.chatService.receiverUid$
    ])
    .pipe(
      filter(([messageId, user, receiverId]) => !!messageId && !!user && !!receiverId),
    )
    .subscribe(([messageId, user, receiverId]) => {
      if (typeof messageId === 'string') {
        this.chatService.deleteMessage(user!.uid, receiverId!, messageId);
        this.messageService.setMessageDeleteId(null);
      }
    });
  }
}
