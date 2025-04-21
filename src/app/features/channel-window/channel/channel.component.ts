import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { MessageTimestampComponent } from '../../message-timestamp/message-timestamp.component';
import { MessageContentComponent } from '../../message-content/message-content.component';
import { MessageEditComponent } from '../../message-edit/message-edit.component';
import { EmojiService } from '../../../shared/services/emoji/emoji-service/emoji-service';
import { AnswerService } from '../../../shared/services/firebase/answer/answer.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    CommonModule,
    MessageTimestampComponent,
    MessageContentComponent,
    MessageEditComponent
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit {
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
  private emojiService = inject(EmojiService);
  private answerService = inject(AnswerService);

  messagesWithUserData$!: Observable<Array<Message & { senderData?: any }>>;
  messagesWithUserDataArray: Array<Message & { senderData?: any }> = [];
  sortedReactions: { [key: string]: any } = {};
  messageAnswers: { [key: string]: any } = {};
  messageEditMode: { [key: string]: boolean } = {};
  viewContext: 'message' | 'answer' = 'message';

  ngOnInit(): void {
    this.getMessagesDate();
    this.convertMessegeData();
    this.getReactions();
    this.getAnswers();
    this.checkMessageEditMode();
    this.deleteMessage();
  }

  getCurrentUserUid() {
    return this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => (user ? [user.uid] : []))
    );
  }

  getMessagesDate() {
    this.messagesWithUserData$ = combineLatest([
      this.getCurrentUserUid(),
      this.messageService.userIdOrChannelId$
    ]).pipe(
      switchMap(([senderId, channalId]) => {
        if (senderId && channalId) {
          return this.getMessagesWithUserData(senderId, channalId);
        } else {
          return of([]);
        }
      })
    );
  }

  getMessagesWithUserData(senderId: string, channalId: string) {
    return this.channelService.getChannelMessages(channalId).pipe(
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

  convertMessegeData() {
    this.messagesWithUserData$.subscribe(messages => {
      this.messagesWithUserDataArray = messages;
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

  getReactions() {
    combineLatest([
      this.messagesWithUserData$,
      this.messageService.userIdOrChannelId$
    ]).subscribe(([messages, channalId]) => {
      if (!messages || messages.length === 0) return;
      const reactionsMap: { [key: string]: any } = {};

      messages.forEach(message => {
        const messageId = message.messageId;
        this.emojiService.subscribeToReactions(channalId, message.messageId, message.messageFrom);

        this.emojiService.reactions$.subscribe(reactions => {
          reactionsMap[messageId] = reactions[messageId] || [];
        });
      });
      this.sortedReactions = reactionsMap;
    });
  }

  getAnswers() {
    combineLatest([
      this.messagesWithUserData$,
      this.messageService.userIdOrChannelId$
    ]).subscribe(([messages, channalId]) => {
      if (!messages || messages.length === 0) return;
      const answersMap: { [key: string]: any } = {};

      messages.forEach(message => {
        const messageId = message.messageId;
        this.answerService.subscribeToAnswers(channalId, messageId, message.messageFrom);

        this.answerService.answers$.subscribe(answers => {
          answersMap[messageId] = answers[messageId] || [];
        });
      });
      this.messageAnswers = answersMap;
    });
  }

  checkMessageEditMode() {
    this.messageService.messageEditMode$.subscribe(messageId => {
      this.messageEditMode = {};
      if (messageId) {
        this.messageEditMode[messageId] = true;
      }
    });
  }

  updateMessage(event: { messageId: string; message: string }) {
      this.messageService.userIdOrChannelId$
      .pipe(take(1))
      .subscribe((channalId) => {
        if (channalId) {
          this.channelService.updateMessage(channalId, event.messageId, { content: event.message });
        } else {
          console.error('User or receiver ID is undefined');
        }
      });
  }

  deleteMessage() {
    combineLatest([
      this.messageService.deleteMessageId$,
      this.messageService.userIdOrChannelId$
    ])
      .pipe(
        filter(([messageId, channalId]) => !!messageId && !!channalId),
      )
      .subscribe(([messageId, channalId]) => {
        if (typeof messageId === 'string') {
          this.channelService.deleteMessage(channalId!, messageId);
          this.messageService.setMessageDeleteId(null);
        }
      });
  }

  trackByMessageId(index: number, message: Message): string {
    return message.messageId;
  }
}
