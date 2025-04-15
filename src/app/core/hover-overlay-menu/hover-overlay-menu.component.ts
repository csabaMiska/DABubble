import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManageMessageDialogComponent } from './manage-message-dialog/manage-message-dialog.component';
import { MessageService } from '../../shared/services/message/message.service';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { StandardEmojisService } from '../../shared/services/emoji/standard-emoji/standard-emojis.service';
import { AnswerService } from '../../shared/services/firebase/answer/answer.service';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { Message } from '../../shared/interface/message.model';

@Component({
  selector: 'app-hover-overlay-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EmojiPickerComponent,
  ],
  providers: [WindowWidthDirective],
  templateUrl: './hover-overlay-menu.component.html',
  styleUrl: './hover-overlay-menu.component.scss'
})
export class HoverOverlayMenuComponent implements OnInit {
  private elementRef = inject(ElementRef);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private messageService = inject(MessageService);
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);
  private standardEmojisService = inject(StandardEmojisService);
  private answerService = inject(AnswerService);
  private chatService = inject(ChatService);

  readonly dialog = inject(MatDialog);
  private manageMessageDialogRef: { [key: string]: MatDialogRef<ManageMessageDialogComponent> } = {};

  @Input() viewContext!: 'message' | 'answer';
  @Input() isOriginalMessage: boolean = false;
  @Input() message!: Message & { senderData?: any };
  @Output() emojiSelected = new EventEmitter<{ emoji: Emoji, messageId: string, messageFrom: string }>();
  @Output() dialogHovered = new EventEmitter<{ messageId: string, isHovered: boolean }>();

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};

  standardEmojis: Array<{ emoji: Emoji }> = this.standardEmojisService.standardEmojis;
  lastSelectedEmojis: Array<{ emoji: Emoji }> = [];
  userData$!: Observable<User>;

  ngOnInit(): void {
    this.getLastUsedEmojis();
  }

  getLastUsedEmojis() {
    this.firebaseAuthService.getCurrentUser().pipe(
      filter(user => user !== null),
      switchMap(user => {
        return this.firebaseUserService.getUserRealTime(user.uid).pipe(
          map(userData => {
            this.lastSelectedEmojis = userData?.lastUsedEmojis ?? [];

            if (this.lastSelectedEmojis.length === 0) {
              this.lastSelectedEmojis = this.standardEmojis.slice(0, 2);
            } else if (this.lastSelectedEmojis.length === 1) {
              this.lastSelectedEmojis.push(this.standardEmojis[1]);
            }
            return { ...userData, lastUsedEmojis: this.lastSelectedEmojis };
          }),
          distinctUntilChanged((prev, curr) => prev.lastUsedEmojis === curr.lastUsedEmojis)
        );
      })
    ).subscribe(user => {
      if (user.uid) {
        this.userData$ = of(user as User);
      }
    });
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

  handleEmojiSelection(selectedEmoji: Emoji, messageId: string, messageFrom: string) {
    this.emojiSelected.emit({ emoji: selectedEmoji, messageId, messageFrom });
    this.updateLastUsedEmojis(selectedEmoji);
  }

  updateLastUsedEmojis(selectedEmoji: Emoji) {
    const emojiExists = this.lastSelectedEmojis.some(item => item.emoji.unicode === selectedEmoji.unicode);
    if (!emojiExists) {
      if (this.lastSelectedEmojis.length === 2) {
        this.lastSelectedEmojis.shift();
      }
      this.lastSelectedEmojis.push({ emoji: selectedEmoji });
      this.userData$.subscribe(user => {
        if (user) {
          this.firebaseUserService.updateUser(user.uid, { lastUsedEmojis: this.lastSelectedEmojis });
        }
      });
    }
  }

  calculateDialogPosition(buttonRect: DOMRect) {
    let left = buttonRect.left + 20;
    let top = buttonRect.bottom;

    return {
      top: `${Math.max(0, top)}px`,
      left: `${Math.max(0, left)}px`
    };
  }

  openManageMessageDialog(event: MouseEvent, messageId: string) {
    const fullMessageId = `${this.viewContext}-${messageId}`;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.buttonRects[fullMessageId] = rect;

    const existingDialogRef = this.manageMessageDialogRef[fullMessageId];

    if (existingDialogRef) {
      existingDialogRef.close();
      delete this.manageMessageDialogRef[fullMessageId];
    } else {
      const dialogRef = this.dialog.open(ManageMessageDialogComponent, {
        position: this.calculateDialogPosition(rect),
        autoFocus: false,
        hasBackdrop: false,
        data: { messageId, viewContext: this.viewContext },
      });

      this.manageMessageDialogRef[fullMessageId] = dialogRef;

      const sub = this.messageService.messageIsHoveredId$
        .pipe(
          debounceTime(100),
          distinctUntilChanged()
        )
        .subscribe(hoveredId => {
          if (hoveredId !== fullMessageId) {
            dialogRef.close();
            delete this.manageMessageDialogRef[fullMessageId];
            sub.unsubscribe();
          }
        });

      dialogRef.afterClosed().subscribe(() => {
        delete this.manageMessageDialogRef[fullMessageId];
        sub.unsubscribe();
      });
    }
  }

  addAnswerToMessage(senderId: string, receiverId: string, messageId: string, messageFrom: string) {
    let chatIdOrChannelId = '';
    if (messageFrom === 'channels') {
      chatIdOrChannelId = receiverId
    } else if (messageFrom === 'chats') {
      chatIdOrChannelId = this.chatService.getChatId(senderId, receiverId);
    }
    this.answerService.setMessageAnswerInfo(messageId, chatIdOrChannelId, receiverId, senderId, messageFrom);
    this.openAnswerWindow();
  }

  openAnswerWindow() {
    this.dashboardService.openAnswerWindow();
    if (this.windowWidthDirective.tabletViewOn) {
      this.dashboardService.closeChannelWindow();
      this.dashboardService.closeChatWindow();
    }
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.closeChannelWindow();
      this.dashboardService.closeChatWindow();
    }
  }

}
