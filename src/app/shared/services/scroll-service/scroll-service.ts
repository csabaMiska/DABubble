import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrollToMessageSubject = new BehaviorSubject<string | null>(null);
  scrollToMessage$ = this.scrollToMessageSubject.asObservable();
  private scrollToAnswerSubject = new BehaviorSubject<string | null>(null);
  scrollToAnswer$ = this.scrollToAnswerSubject.asObservable();

  setScrollToMessageId(messageId: string | null) {
    this.scrollToMessageSubject.next(messageId);
  }

  clearMessageTarget() {
    this.scrollToMessageSubject.next(null);
  }

  setScrollToAnswerId(answerId: string | null) {
    this.scrollToAnswerSubject.next(answerId);
  }

  clearAnswerTarget() {
    this.scrollToAnswerSubject.next(null);
  }

  scrollToMessage(messageId: string, scrollContainer: ElementRef<HTMLDivElement>) {
    const container = scrollContainer.nativeElement as HTMLElement;

    const tryScroll = (attemptsLeft = 20) => {
      const target = container.querySelector(`#message-${messageId}`) as HTMLElement;
  
      if (target && target.offsetTop > 0) {
        container.scrollTo({ top: target.offsetTop - 150, behavior: 'smooth' });
      } else if (attemptsLeft > 0) {
        setTimeout(() => tryScroll(attemptsLeft - 1), 100);
      } else {
        console.warn(`Message not found: #message-${messageId}`);
      }
    };
  
    tryScroll();
  }

  scrollToAnswer(messageId: string, scrollContainer: ElementRef<HTMLDivElement>) {
    const container = scrollContainer.nativeElement as HTMLElement;

    const tryScroll = (attemptsLeft = 20) => {
      const target = container.querySelector(`#message-${messageId}`) as HTMLElement;
  
      if (target && target.offsetTop > 0) {
        container.scrollTo({ top: target.offsetTop - 350, behavior: 'smooth' });
      } else if (attemptsLeft > 0) {
        setTimeout(() => tryScroll(attemptsLeft - 1), 100);
      } else {
        console.warn(`Message not found: #message-${messageId}`);
      }
    };
  
    tryScroll();
  }
  
  scrollToBottom(scrollContainer: ElementRef<HTMLDivElement>) {
    const container = scrollContainer?.nativeElement;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }

  scrollToBottomInstant(scrollContainer: ElementRef<HTMLDivElement>) {
    const container = scrollContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
