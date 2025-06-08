import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { CommonModule } from '@angular/common';
import { insertTextIntoField } from 'text-field-edit';
import { ObjectPickerComponent } from '../../core/object-picker/object-picker.component';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { map, filter, max } from 'rxjs';

@Component({
  selector: 'app-message-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    EmojiPickerComponent,
    ObjectPickerComponent
  ],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss'
})
export class MessageInputFieldComponent implements OnInit, OnChanges {
  @Input() content!: User | Channel;
  @Output() messageSent = new EventEmitter<string>();

  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  private elementRef = inject(ElementRef);
  private channelService = inject(ChannelService);
  private firebaseUserService = inject(FirebaseUserService);

  messageReceiver!: string;
  messageContent: string = '';
  placeholderText: string = '';
  inputEmojiPickerId!: string;
  objectSelectorIsOpen: boolean = false;
  loadedUsers: any[] = [];
  isLoadingUsers!: boolean;

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};
  pickerBtnRects: DOMRect = {} as DOMRect;

  ngOnInit(): void {
    this.messageContent = '';
    this.placeholderText = 'Nachricht an';
    this.setMessageReceiver();
    this.setInputEmojiPickerId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.setMessageReceiver();
      this.focusTextarea();
      this.messageContent = '';
    }
  }

  setMessageReceiver(): void {
    if (!this.content || !('type' in this.content)) {
      this.placeholderText = 'Antworten...';
      this.messageReceiver = ''
    } else if (this.content.type === 'User') {
      this.messageReceiver = (this.content as User).name || '';
    } else if (this.content.type === 'Channel') {
      const channelTitle = (this.content as Channel).title;
      this.messageReceiver = '#' + channelTitle;
    }
    this.messageContent = '';
  }

  setInputEmojiPickerId(): void {
    if (!this.content || !('type' in this.content)) {
      this.inputEmojiPickerId = 'answers';
    } else if (this.content.type === 'User') {
      this.inputEmojiPickerId = (this.content as User).uid;
    } else if (this.content.type === 'Channel') {
      this.inputEmojiPickerId = (this.content as Channel).channelId;
    }
  }

  focusTextarea() {
    setTimeout(() => {
      if (this.messageTextarea) {
        this.messageTextarea.nativeElement.focus();
      }
    });
  }

  handleEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.getCurrentMessage();
    }
  }

  getCurrentMessage() {
    if (this.messageContent.trim().length > 0) {
      this.messageSent.emit(this.messageContent);
      this.messageContent = '';
    } else {
      return;
    }
  }

  openEmojiPicker(event: MouseEvent, inputEmojiPickerId: string) {
    this.closeObjectSelector();
    this.showEmojiPicker[inputEmojiPickerId] = !this.showEmojiPicker[inputEmojiPickerId];
    if (this.showEmojiPicker[inputEmojiPickerId]) {
      this.buttonRects[inputEmojiPickerId] = (event.currentTarget as HTMLElement).getBoundingClientRect();
    } else {
      delete this.buttonRects[inputEmojiPickerId];
    }
  }

  @HostListener('document:click', ['$event'])
  onbodyClick(event: MouseEvent) {
    const clickedTextarea = this.messageTextarea?.nativeElement?.contains(event.target as Node);

    if (!this.elementRef.nativeElement.contains(event.target) && !clickedTextarea) {
      this.closeEmojiPickers();
      this.closeObjectSelector();
    }
  }

  closePickers() {
    this.closeEmojiPickers();
    this.closeObjectSelector();
  }

  closeEmojiPickers() {
    this.showEmojiPicker = {};
    this.buttonRects = {};
  }

  closeObjectSelector() {
    this.objectSelectorIsOpen = false;
    this.pickerBtnRects = {} as DOMRect;
  }

  handleEmojiSelection(selectedEmoji: Emoji) {
    const emoji = selectedEmoji?.unicode || selectedEmoji.unicode;
    const textarea = this.messageTextarea.nativeElement;

    insertTextIntoField(textarea, emoji);

    this.messageContent = textarea.value;
    this.closeEmojiPickers();
  }

  public pickerPosition = { bottom: '0', left: '0' };

  calculateObjectSelectorPosition(buttonRect: DOMRect) {
    if (!buttonRect) return {};

    const bottom = window.innerHeight - buttonRect.top;
    const left = buttonRect.left + 40;

    console.log('Object selector position:', { buttonRect, bottom, left });

    this.pickerPosition = {
      bottom: `${bottom}px`,
      left: `${left}px`
    };

    return this.pickerPosition;
  }

  openUserSelector(event: MouseEvent) {
    this.closeEmojiPickers();
    this.objectSelectorIsOpen = !this.objectSelectorIsOpen;
    this.pickerBtnRects = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.calculateObjectSelectorPosition(this.pickerBtnRects)
    this.loadUsersForObjectPicker();
  }

  loadUsersForObjectPicker() {
    this.isLoadingUsers = true;
    if (this.content.type === 'User') {
      const receiverUid = (this.content as User).uid || '';
      this.loadChatUser(receiverUid);
      this.isLoadingUsers = false;
    } else if (this.content.type === 'Channel') {
      this.loadChannelMembers();
      this.isLoadingUsers = false;
    }
  }

  loadChatUser(receiverUid: string) {
    this.firebaseUserService.getUserRealTime(receiverUid).pipe(
      filter(user => !!user),
      map(user => {
        const result = {
          type: 'user' as const,
          data: user
        };
        return result;
      })
    ).subscribe(result => {
      this.loadedUsers = [result];
    });
  }

  loadChannelMembers() {
    this.channelService.channelMembers$.pipe(
      filter(members => !!members && members.length > 0),
      map(members => {
        return members.map(member => ({
          type: 'user' as const,
          data: member
        }));
      })
    ).subscribe(users => {
      this.loadedUsers = users;
    });
  }
}