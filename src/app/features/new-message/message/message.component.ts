import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ChatService } from '../../../shared/services/firebase/chat/chat.service';
import { combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { EmojiPickerComponent } from '../../../core/emoji-picker/emoji-picker.component';
import { CustomDatePipe } from '../../../shared/pipe/custom.date.pipe'
import { HoverOverlayMenuComponent } from '../../../core/hover-overlay-menu/hover-overlay-menu.component';
import { Emoji } from '../../../shared/interface/emoji.model';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EmojiPickerComponent,
    CustomDatePipe,
    HoverOverlayMenuComponent
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit {
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private chatService = inject(ChatService);
  private elementRef = inject(ElementRef);

  messagesWithUserData$!: Observable<Array<Message & { senderData?: any }>>;
  messagesWithUserDataArray: Array<Message & { senderData?: any }> = [];

  isSender: boolean = false;

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};

  ngOnInit(): void {
    this.getMessagesDate();
    this.convertMessegeData();
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

  emitedEmojiSelected(selectedEmoji: Emoji, messageId: string) {
    this.addEmojiSelection(selectedEmoji, messageId);
  }

  addEmojiSelection(selectedEmoji: Emoji, messageId: string) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.chatService.receiverUid$.pipe(
          switchMap(receiverUid => {
            if (senderUid) {
              return this.chatService.addUserReaction(senderUid, receiverUid, messageId, selectedEmoji);
            } else {
              return [];
            }
          })
        );
      })
    ).subscribe({
      next: () => {
        this.closeAllPickers();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getReactions(message: Message) {
    return message.reactions ? Object.values(message.reactions) : [];
  }

  deleteSelectedEmoji(messageId: string, selectedEmoji: Emoji) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.chatService.receiverUid$.pipe(
          switchMap(receiverUid => {
            if (senderUid) {
              return this.chatService.removeUserReaction(senderUid, receiverUid, messageId, selectedEmoji);
            } else {
              return [];
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
}
