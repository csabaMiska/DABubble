import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageEditModeSubject = new BehaviorSubject<string | null>(null);
  messageEditMode$ = this.messageEditModeSubject.asObservable();
  private deleteMessageIdSubject = new BehaviorSubject<string | null>(null);
  deleteMessageId$ = this.deleteMessageIdSubject.asObservable();
  private messageIsHoveredIdSubject = new BehaviorSubject<string | null>(null);
  messageIsHoveredId$ = this.messageIsHoveredIdSubject.asObservable();

  setMessageEditMode(messageId: string | null) {
    this.messageEditModeSubject.next(messageId);
  }

  setMessageDeleteId(messageId: string | null) {
    this.deleteMessageIdSubject.next(messageId);
  }

  setMessageIsHoveredId(messageId: string | null) {
    this.messageIsHoveredIdSubject.next(messageId);
  }
}