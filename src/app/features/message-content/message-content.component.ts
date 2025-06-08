import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { Message } from '../../shared/interface/message.model';
import { HoverOverlayMenuComponent } from '../../core/hover-overlay-menu/hover-overlay-menu.component';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { of, switchMap, take } from 'rxjs';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { Emoji } from '../../shared/interface/emoji.model';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../shared/services/message/message.service';
import { EmojiService } from '../../shared/services/emoji/emoji-service/emoji-service';
import { AnswerService } from '../../shared/services/firebase/answer/answer.service';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';

@Component({
  selector: 'app-message-content',
  standalone: true,
  imports: [
    CommonModule,
    HoverOverlayMenuComponent,
    EmojiPickerComponent,
    MatIconModule
  ],
  templateUrl: './message-content.component.html',
  styleUrl: './message-content.component.scss'
})
export class MessageContentComponent implements OnInit {
  @Input() message!: Message & { senderData?: any };
  @Input() sortedReactions: { [key: string]: any } = {};
  @Input() messageAnswers: { [key: string]: any } = {};
  @Input() viewContext: 'message' | 'answer' = 'message';
  @Input() isOriginalMessage: boolean = false;

  private firebaseAuthService = inject(FirebaseAuthService);
  private chatService = inject(ChatService);
  private channelService = inject(ChannelService);
  private elementRef = inject(ElementRef);
  private messageService = inject(MessageService);
  private emojiService = inject(EmojiService);
  private answerService = inject(AnswerService);

  isSender: boolean = false;

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};
  hoveredMessageId: string | null = null;

  ngOnInit(): void {
    this.messageService.messageIsHoveredId$.subscribe(id => {
      this.hoveredMessageId = id;
    });
  }

  getCurrentUserUid() {
    return this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => (user ? [user.uid] : []))
    );
  }

  openCloseEmojiPicker(event: MouseEvent, messageId: string) {
    this.showEmojiPicker[messageId] = !this.showEmojiPicker[messageId];
    if (this.showEmojiPicker[messageId]) {
      this.buttonRects[messageId] = (event.currentTarget as HTMLElement).getBoundingClientRect();
    } else {
      delete this.buttonRects[messageId];
    }
  }

  @HostListener('body:click', ['$event'])
  onbodyClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllPickers();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.closeAllPickers();
  }

  closeAllPickers() {
    this.showEmojiPicker = {};
    this.buttonRects = {};
  }

  emitedEmojiSelected(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    if (messageFrom === 'answers') {
      this.addEmojiSelectionToAnswer(selectedEmoji, messageId, messageFrom);
    } else {
      this.addEmojiSelection(selectedEmoji, messageId, messageFrom);
    }
  }

  addEmojiSelected(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    if (messageFrom === 'answers') {
      this.addEmojiSelectionToAnswer(selectedEmoji, messageId, messageFrom);
    } else {
      this.addEmojiSelection(selectedEmoji, messageId, messageFrom);
    }
  }

  handleEmojiClick(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    if (messageFrom === 'answers') {
      this.handleEmojiClickToAnswer(selectedEmoji, messageId, messageFrom);
    } else {
      this.handleEmojiClickToMessage(selectedEmoji, messageId, messageFrom);
    }
  }

  addEmojiSelection(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.channelService.userIdOrChannelId$.pipe(
          take(1),
          switchMap(emojiReceiver => {
            if (senderUid) {
              let chatIdOrChannelId = '';
              if (messageFrom === 'chats') {
                chatIdOrChannelId = this.chatService.getChatId(senderUid, emojiReceiver);
              } else if (messageFrom === 'channels') {
                chatIdOrChannelId = emojiReceiver
              }
              return this.emojiService.addUserReaction(chatIdOrChannelId, senderUid, messageId, messageFrom, selectedEmoji);
            } else {
              return of();
            }
          })
        );
      })
    ).subscribe({
      next: () => this.closeAllPickers(),
      error: (error) => console.error(error)
    });
  }

  addEmojiSelectionToAnswer(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.answerService.messageAnswares$.pipe(
          take(1),
          switchMap(originalMessage => {
            if (originalMessage) {
              return this.emojiService.addUserReaction(originalMessage.chatIdOrChannelId, senderUid, originalMessage.messageId, originalMessage.messageFrom, selectedEmoji, messageId, messageFrom);
            } else {
              return of();
            }
          }));
      })
    ).subscribe({
      next: () => this.closeAllPickers(),
      error: (error) => console.error(error)
    });
  }

  handleEmojiClickToMessage(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    this.getCurrentUserUid().pipe(
      take(1),
      switchMap(senderUid => {
        return this.channelService.userIdOrChannelId$.pipe(
          take(1),
          switchMap(emojiReceiver => {
            if (senderUid) {
              let chatIdOrChannelId = '';
              if (messageFrom === 'chats') {
                chatIdOrChannelId = this.chatService.getChatId(senderUid, emojiReceiver);
              } else if (messageFrom === 'channels') {
                chatIdOrChannelId = emojiReceiver; 
              }
              return this.emojiService.updateUserReaction(chatIdOrChannelId, senderUid, messageId, messageFrom, selectedEmoji);
            } else {
              return of();
            }
          })
        );
      })
    ).subscribe({
      error: (error) => {
        console.error(error);
      }
    });
  }

  handleEmojiClickToAnswer(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.answerService.messageAnswares$.pipe(
          take(1),
          switchMap(originalMessage => {
            if (originalMessage) {
              return this.emojiService.updateUserReaction(originalMessage.chatIdOrChannelId, senderUid, originalMessage.messageId, originalMessage.messageFrom, selectedEmoji, messageId, messageFrom);
            } else {
              return of();
            }
          }));
      })
    ).subscribe({
      error: (error) => console.error(error)
    });
  }

  handleMessageHover(isHovered: boolean, messageId: string) {
    this.messageService.setMessageIsHoveredId(isHovered ? `${this.viewContext}-${messageId}` : null);
  }
}
