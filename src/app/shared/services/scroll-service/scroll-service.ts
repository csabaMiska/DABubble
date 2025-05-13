import { ElementRef, Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrollToMessageSubject = new ReplaySubject<string>(1);
  scrollToMessage$ = this.scrollToMessageSubject.asObservable();

  setScrollToMessageId(messageId: string) {
    this.scrollToMessageSubject.next(messageId);
  }

  scrollToMessage(messageId: string, scrollContainer: ElementRef<HTMLDivElement>) {
    setTimeout(() => {
      const container = scrollContainer.nativeElement as HTMLElement;
      const target = container.querySelector(`#message-${messageId}`) as HTMLElement;
      if (target) {
        const containerTop = container.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        const offset = targetTop - containerTop + container.scrollTop;

        container.scrollTo({ top: offset, behavior: 'smooth' });
      } else {
        console.warn(`Nem található DOM elem: message-${messageId}`);
        return;
      }
    }, 100);
  }

  scrollToBottom(scrollContainer: ElementRef<HTMLDivElement>) {
    setTimeout(() => {
      const container = scrollContainer?.nativeElement;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }, 0); // vagy 100-200 ms, ha aszinkron betöltés lassú
  }
}
