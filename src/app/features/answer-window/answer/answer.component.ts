import { Component, inject, OnInit } from '@angular/core';
import { MessageContentComponent } from '../../message-content/message-content.component';
import { combineLatest, filter, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { AnswerService } from '../../../shared/services/firebase/answer/answer.service';
import { AnswerInfo } from '../../../shared/interface/answer-info.model';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { EmojiService } from '../../../shared/services/emoji/emoji-service/emoji-service';
import { MessageEditComponent } from '../../message-edit/message-edit.component';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'app-answer',
  standalone: true,
  imports: [
    CommonModule,
    MessageContentComponent,
    MessageEditComponent,
  ],
  templateUrl: './answer.component.html',
  styleUrl: './answer.component.scss'
})
export class AnswerComponent implements OnInit {
  private answerService = inject(AnswerService);
  private messageService = inject(MessageService);
  private emojiService = inject(EmojiService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private destroyed$ = new Subject<void>();

  messageWithUserData$!: Observable<Message & { senderData?: any }>;
  messageAnswers$!: Observable<Array<Message & { senderData?: any }>>;
  sortedReactionsToMessage: { [key: string]: any } = {};
  sortedReactionsToAnswers: { [key: string]: any } = {};
  answerEditMode: { [key: string]: boolean } = {};
  viewContext: 'message' | 'answer' = 'answer';

  ngOnInit(): void {
    this.getMessage();
    this.getReactionsToMessage();
    this.getAnswers();
    this.getReactionsToAnswers();
    this.checkAnswerEditMode();
    this.deleteAnswer();
  }

  getMessage() {
    this.messageWithUserData$ = this.answerService.messageAnswares$.pipe(
      filter((info): info is AnswerInfo => !!info),
      switchMap((info) =>
        combineLatest([
          this.answerService.getMessage(info.chatIdOrChannelId, info.messageId, info.messageFrom),
          this.firebaseUserService.getUserRealTime(info.senderId),
          this.firebaseAuthService.getCurrentUser()
        ]).pipe(
          map(([message, senderData, currentUser]) => {
            if (!message) throw new Error("Message not found.");
            return {
              ...message,
              senderData,
              isSender: message.senderId === currentUser?.uid,
            };
          })
        )
      )
    );
  }

  getReactionsToMessage() {
    const reactionsMap: { [key: string]: any } = {};
    this.answerService.messageAnswares$.subscribe(
      (info) => {
        if (info) {
          this.emojiService.subscribeToReactions(info.chatIdOrChannelId, info.messageId, info.messageFrom);
        }
        this.emojiService.reactions$.subscribe(reaction => {
          if (info?.messageId) {
            reactionsMap[info.messageId] = reaction[info.messageId] || [];
          }
        })
        this.sortedReactionsToMessage = reactionsMap;
      }
    )
  }

  getAnswers() {
    this.messageAnswers$ = this.answerService.messageAnswares$.pipe(
      filter((info): info is AnswerInfo => !!info),
      switchMap((info) =>
        this.answerService.getAnswers(info.chatIdOrChannelId, info.messageId, info.messageFrom).pipe(
          switchMap((answers: Message[]) => {
            if (answers.length === 0) return of([]);
            const enrichedAnswers$ = answers.map(answer =>
              combineLatest([
                of(answer),
                this.firebaseUserService.getUserRealTime(answer.senderId),
                this.firebaseAuthService.getCurrentUser()
              ]).pipe(
                map(([answer, senderData, currentUser]) => ({
                  ...answer,
                  senderData,
                  isSender: answer.senderId === currentUser?.uid
                }))
              )
            );

            return combineLatest(enrichedAnswers$);
          })
        )
      )
    );
  }

  getReactionsToAnswers() {
    combineLatest([
      this.messageAnswers$,
      this.answerService.messageAnswares$
    ]).subscribe(([answers, info]) => {
      if (!info || answers.length === 0) return;
      answers.forEach(answer => {
        const answerId = answer.messageId;
        this.answerService.subscribeToReactions(
          info.chatIdOrChannelId,
          info.messageId,
          info.messageFrom,
          answerId
        );
      });
      this.answerService.reactions$.pipe(takeUntil(this.destroyed$)).subscribe(reactions => {
        const reactionsMap: { [key: string]: any[] } = {};
        answers.forEach(answer => {
          reactionsMap[answer.messageId] = reactions[answer.messageId] || [];
        });
        this.sortedReactionsToAnswers = { ...reactionsMap };
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  
  checkAnswerEditMode() {
    this.messageService.messageEditMode$.subscribe(messageId => {
      this.answerEditMode = {};
      if (messageId) {
        this.answerEditMode[messageId] = true;
      }
    });
  }

  updateAnswer(event: { messageId: string; message: string }) {
    combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.answerService.messageAnswares$
    ])
      .pipe(take(1))
      .subscribe(([user, answerInfo]) => {
        if (user && answerInfo) {
          this.answerService.updateAnswer(
            answerInfo.chatIdOrChannelId, 
            answerInfo.messageId,
            event.messageId,
            answerInfo.messageFrom,
            { content: event.message });
        } else {
          console.error('AnswerId is undefined');
        }
      });
  }

  deleteAnswer() {
    combineLatest([
      this.messageService.deleteMessageId$,
      this.answerService.messageAnswares$
    ])
    .pipe(
      filter(([answerId, answerInfo]) => !!answerId && !!answerInfo),
    )
    .subscribe(([answerId, answerInfo]) => {
        this.answerService.deleteAnswer(
          answerInfo!.chatIdOrChannelId, 
          answerInfo!.messageId,
          answerId!,
          answerInfo!.messageFrom);
        this.messageService.setMessageDeleteId(null);
    });
  }
}
