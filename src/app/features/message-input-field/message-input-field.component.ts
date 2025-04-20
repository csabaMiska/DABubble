import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/interface/user.model';
import { Channel } from '../../shared/interface/channal.model';

@Component({
  selector: 'app-message-input-field',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule
  ],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss'
})
export class MessageInputFieldComponent implements OnInit, OnChanges {
  @Input() content!: User | Channel;
  @Output() messageSent = new EventEmitter<string>();

  messageReceiver!: string;
  messageContent: string = '';
  textareaShouldFocus = true;
  placeholderText: string = '';
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;

  ngOnInit(): void {
    this.messageContent = '';
    this.placeholderText = 'Nachricht an';
    this.setMessageReceiver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.setMessageReceiver();
      this.textareaShouldFocus = true;
      this.messageContent = '';
      this.focusTextarea();
    }
  }

  setMessageReceiver(): void {
    if (!this.content || !('type' in this.content)) {
      this.placeholderText = 'Antworten...';
      this.messageReceiver= ''
    } else if (this.content.type === 'User') {
      this.messageReceiver = (this.content as User).name || '';
    } else if (this.content.type === 'Channel') {
      const channelTitle = (this.content as Channel).title;
      this.messageReceiver = '#' + channelTitle;
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
}
