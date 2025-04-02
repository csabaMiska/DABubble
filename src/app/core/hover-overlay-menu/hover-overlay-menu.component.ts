import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';

@Component({
  selector: 'app-hover-overlay-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EmojiPickerComponent,
  ],
  templateUrl: './hover-overlay-menu.component.html',
  styleUrl: './hover-overlay-menu.component.scss'
})
export class HoverOverlayMenuComponent implements OnInit {
  private elementRef = inject(ElementRef);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);

  @Input() messageId!: string;
  @Input() isSender!: boolean;
  @Output() emojiSelected = new EventEmitter<{ emoji: Emoji, messageId: string }>();

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};

  standardEmojis: Array<{ emoji: Emoji }> = [
    {
      "emoji": {
        "annotation": "check box with check",
        "group": 8,
        "order": 4633,
        "shortcodes": [
          "ballot_box_with_check"
        ],
        "tags": [
          "ballot",
          "box",
          "check",
          "checked",
          "done",
          "off",
          "tick",
          "✔"
        ],
        "unicode": "☑️",
        "version": 0.6,
        "skinTone": 1
      }
    },
    {
      "emoji": {
        "annotation": "thumbs up",
        "group": 1,
        "order": 351,
        "shortcodes": [
          "+1",
          "thumbsup",
          "yes"
        ],
        "skins": [
          { "tone": 1, "unicode": "👍🏻", "version": 1 },
          { "tone": 2, "unicode": "👍🏼", "version": 1 },
          { "tone": 3, "unicode": "👍🏽", "version": 1 },
          { "tone": 4, "unicode": "👍🏾", "version": 1 },
          { "tone": 5, "unicode": "👍🏿", "version": 1 }
        ],
        "tags": [
          "+1",
          "good",
          "hand",
          "like",
          "thumb",
          "up",
          "yes"
        ],
        "unicode": "👍️",
        "version": 0.6,
        "skinTone": 1
      }
    }
  ];
  lastSelectedEmojis: Array<{ emoji: Emoji }> = [];
  userData$!: Observable<User>;

  ngOnInit(): void {
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
          })
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

  handleEmojiSelection(selectedEmoji: Emoji, messageId: string) {
    this.emojiSelected.emit({ emoji: selectedEmoji, messageId });
    this.updateLastUsedEmojis(selectedEmoji);
    this.closeAllPickers();
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
  
}
