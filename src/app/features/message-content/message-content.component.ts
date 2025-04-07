import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener,inject, Input, OnInit } from '@angular/core';
import { Message } from '../../shared/interface/message.model';
import { HoverOverlayMenuComponent } from '../../core/hover-overlay-menu/hover-overlay-menu.component';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { switchMap } from 'rxjs';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { Emoji } from '../../shared/interface/emoji.model';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../shared/services/message/message.service';

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

  private firebaseAuthService = inject(FirebaseAuthService);
  private chatService = inject(ChatService);
  private elementRef = inject(ElementRef);
  private messageService = inject(MessageService);
  private messageContentElement!: HTMLElement;

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

  handleEmojiClick(messageId: string, selectedEmoji: Emoji) {
    this.getCurrentUserUid().pipe(
      switchMap(senderUid => {
        return this.chatService.receiverUid$.pipe(
          switchMap(receiverUid => {
            if (senderUid) {
              return this.chatService.updateUserReaction(senderUid, receiverUid, messageId, selectedEmoji);
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

  handleMessageHover(isHovered: boolean, messageId: string) {
    this.messageService.setMessageIsHoveredId(isHovered ? messageId : null);
  }
}
