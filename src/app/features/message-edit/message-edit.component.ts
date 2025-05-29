import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../shared/interface/message.model';
import { MessageService } from '../../shared/services/message/message.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-edit',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule
  ],
  templateUrl: './message-edit.component.html',
  styleUrl: './message-edit.component.scss'
})
export class MessageEditComponent implements OnChanges {
  private messageService = inject(MessageService);

  @Input() message!: Message;
  @Output() updateMessage = new EventEmitter<{ messageId: string, content: string }>();

  @ViewChild('editTextarea') editTextarea!: ElementRef;
  textareaShouldFocus = true;
  messageContent: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']) {
      this.messageContent = this.message.content;
      this.textareaShouldFocus = true;
      this.focusTextarea();
    }
  }

  focusTextarea() {
    if (this.textareaShouldFocus) {
      setTimeout(() => {
        if (this.editTextarea) {
          this.editTextarea.nativeElement.focus();
          this.textareaShouldFocus = false;
        }
      });
    }
  }

  cancelEdit(messageID: string) {
    this.messageService.setMessageEditMode(null); 
  }

  saveMessage(messageID: string) {
    if (this.messageContent.trim() === '') {
      return;
    }
    this.updateMessage.emit({ messageId: messageID, content: this.messageContent });
    this.messageService.setMessageEditMode(null); 
  }

}
