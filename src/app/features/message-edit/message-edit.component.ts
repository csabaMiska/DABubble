import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../shared/interface/message.model';

@Component({
  selector: 'app-message-edit',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './message-edit.component.html',
  styleUrl: './message-edit.component.scss'
})
export class MessageEditComponent implements OnChanges {
@Input() message!: Message;

@ViewChild('editTextarea') editTextarea!: ElementRef;
textareaShouldFocus = true;

ngOnChanges(changes: SimpleChanges): void {
  if (changes['message']) {
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

}
