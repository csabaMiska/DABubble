import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { MessageInputFieldComponent } from '../message-input-field/message-input-field.component';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, filter, Observable, tap, take } from 'rxjs';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { CommonModule } from '@angular/common';
import { AnswerService } from '../../shared/services/firebase/answer/answer.service';
import { AnswerComponent } from './answer/answer.component';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { MessageService } from '../../shared/services/message/message.service';
import { Message } from '../../shared/interface/message.model';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { ScrollService } from '../../shared/services/scroll-service/scroll-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-answer-window',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MessageInputFieldComponent,
    AnswerComponent,
    MatProgressSpinnerModule
  ],
  providers: [WindowWidthDirective],
  templateUrl: './answer-window.component.html',
  styleUrl: './answer-window.component.scss'
})
export class AnswerWindowComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private answerService = inject(AnswerService);
  private messageService = inject(MessageService);
  private chatService = inject(ChatService);
  private channelService = inject(ChannelService);
  private scrollService = inject(ScrollService);

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;

  messageInfos$!: Observable<any>;
  messageInfoType: 'User' | 'Channel' | null = null;
  chatIsLoading!: boolean;
  currentContent!: User | Channel;

  ngOnInit(): void {
    this.messageService.messageInfoId$.subscribe(messageInfo => {
      if (messageInfo?.messegeType === 'User') {
        this.messageInfoType = 'User';
        this.messageInfos$ = this.firebaseUserService.getUserRealTime(messageInfo.messageId).pipe(
          filter((user): user is User => user !== undefined),
          tap(user => {
            this.currentContent = user;
          })
        );
      }
      else if (messageInfo?.messegeType === 'Channel') {
        this.messageInfoType = 'Channel';
        this.messageInfos$ = this.channelService.getChannelById(messageInfo.messageId).pipe(
          filter((channel): channel is Channel => channel !== undefined),
          tap(channel => {
            this.currentContent = channel;
          })
        );
      }
    });
  }

  onMessageReceived(answer: string) {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.channelService.userIdOrChannelId$,
      this.answerService.messageAnswares$
    ])
      .pipe(take(1))
      .subscribe(([user, receiverId, originalMessage]) => {
        if (user && receiverId && originalMessage) {
          const senderId = user.uid;
          const messageId = originalMessage.messageId;
          const messageFrom = originalMessage.messageFrom;
          const channelId = originalMessage.chatIdOrChannelId;
          const chatId = this.chatService.getChatId(senderId, receiverId);
          if (messageFrom === 'chats') {
            this.addAnswer(chatId, messageId, messageFrom, answer, senderId);
            this.chatService.updateMessage(senderId, receiverId, messageId, { lastAnswerTimestamp: new Date().toISOString() });
          } else if (messageFrom === 'channels') {
            this.addAnswer(channelId, messageId, messageFrom, answer, senderId);
            this.channelService.updateMessage(channelId, messageId, { lastAnswerTimestamp: new Date().toISOString() });
          }
        }
      });
  }

  addAnswer(chatIdOrChannelId: string, messageId: string, messageFrom: string, answer: string, senderId: string): void {
    const newAnswer: Partial<Message> = {
      senderId: senderId,
      receiverId: messageId,
      timestamp: new Date().toISOString(),
      content: answer,
    };
    if (newAnswer.senderId && newAnswer.receiverId && newAnswer.content) {
      this.answerService.addAnswer(chatIdOrChannelId, messageId, messageFrom, newAnswer);
      setTimeout(() => {
        this.scrollService.scrollToBottom(this.scrollContainerRef);
      }, 100);
    } else {
      console.error('Invalid answer data', newAnswer);
    }
  }

  closeAnswerWindow(messageInfoType: 'User' | 'Channel' | null) {
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.tabletViewOn && messageInfoType === 'Channel') {
      this.dashboardService.openChannelWindow();
    } else {
      this.dashboardService.openChatWindow();
    }
  }
}
