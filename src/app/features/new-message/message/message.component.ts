import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ChatService } from '../../../shared/services/firebase/chat/chat.service';
import { combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { EmojiPickerComponent } from '../../../core/emoji-picker/emoji-picker.component';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EmojiPickerComponent,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit {
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private chatService = inject(ChatService);
  private elementRef = inject(ElementRef)
  messagesWithUserData$!: Observable<Array<Message & { senderData?: any }>>;
  isSender: boolean = false;
  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};
  reactionsStyles$: Observable<Map<string, boolean>> | undefined;

  ngOnInit(): void {
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
    this.getReactionStyle();
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

  handleEmojiSelection(selectedEmoji: any, messageId: string) {
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
      next: (response) => {
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

  getReactionKeys(reactions: Record<string, any>): string[] {
    return reactions ? Object.keys(reactions) : [];
  }

  getReactionStyle(): void{
    this.reactionsStyles$ = this.messagesWithUserData$.pipe(
      switchMap(messages => this.getCurrentUserUid().pipe(
        map(currentUserUid => {
          const reactionStyles = new Map<string, boolean>();
  
          messages.forEach(message => {
            if (message.reactions) {
              Object.entries(message.reactions).forEach(([userId, reaction]) => {
                reactionStyles.set(userId, currentUserUid === userId);
              });
            }
          });
  
          return reactionStyles;
        })
      ))
    );
  }
}

