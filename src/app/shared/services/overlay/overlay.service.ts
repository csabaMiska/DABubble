import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OverlayMessage {
  text: string;
  showIcon?: boolean;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private overlayMessageSubject = new BehaviorSubject<OverlayMessage | null>(null);
  overlayMessage$ = this.overlayMessageSubject.asObservable();

  showOverlay(text: string, showIcon: boolean, icon: string) {
    this.overlayMessageSubject.next({ text, showIcon, icon });

    setTimeout(() => {
      this.hideOverlay();
    }, 1800);
  }

  hideOverlay() {
    this.overlayMessageSubject.next(null);
  }
}
