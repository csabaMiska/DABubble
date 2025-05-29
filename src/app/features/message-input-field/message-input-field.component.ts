import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';
import { EmojiPickerComponent } from '../../core/emoji-picker/emoji-picker.component';
import { Emoji } from '../../shared/interface/emoji.model';
import { CommonModule } from '@angular/common';
import { insertTextIntoField } from 'text-field-edit';

@Component({
  selector: 'app-message-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    EmojiPickerComponent
  ],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss'
})
export class MessageInputFieldComponent implements OnInit, OnChanges {
  @Input() content!: User | Channel;
  @Output() messageSent = new EventEmitter<string>();
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;

  textareaShouldFocus = true;
  messageReceiver!: string;
  messageContent: string = '';
  placeholderText: string = '';
  inputEmojiPickerId!: string;

  showEmojiPicker: { [key: string]: boolean } = {};
  buttonRects: { [key: string]: DOMRect } = {};

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
      this.textareaShouldFocus = true;
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
    if (this.textareaShouldFocus) {
      setTimeout(() => {
        if (this.messageTextarea) {
          this.messageTextarea.nativeElement.focus();
          this.textareaShouldFocus = false;
        }
      });
    }
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
    console.log(this.inputEmojiPickerId);
    this.showEmojiPicker[inputEmojiPickerId] = !this.showEmojiPicker[inputEmojiPickerId];
    if (this.showEmojiPicker[inputEmojiPickerId]) {
      this.buttonRects[inputEmojiPickerId] = (event.currentTarget as HTMLElement).getBoundingClientRect();
    } else {
      delete this.buttonRects[inputEmojiPickerId];
    }
  }

  closeEmojiPickers() {
    this.showEmojiPicker = {};
    this.buttonRects = {};
  }

  handleEmojiSelection(selectedEmoji: Emoji) {
    const emoji = selectedEmoji?.unicode || selectedEmoji.unicode;
    const textarea = this.messageTextarea.nativeElement;
    
    insertTextIntoField(textarea, emoji);

    this.messageContent = textarea.value;
    this.closeEmojiPickers();
  }
}