import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private channelWindowOpenSubject = new BehaviorSubject<boolean>(false);
  private answerWindowOpenSubject = new BehaviorSubject<boolean>(false);
  private chatWindowOpenSubject = new BehaviorSubject<boolean>(false);
  private sideNavOpenSubject = new BehaviorSubject<boolean>(true);

  channelWindowIsOpen$ = this.channelWindowOpenSubject.asObservable();
  answerWindowIsOpen$ = this.answerWindowOpenSubject.asObservable();
  chatWindowIsOpen$ = this.chatWindowOpenSubject.asObservable();
  sideNavIsOpen$ = this.sideNavOpenSubject.asObservable();

  openChannelWindow() {
    this.channelWindowOpenSubject.next(true);
  }

  closeChannelWindow() {
    this.channelWindowOpenSubject.next(false);
  }

  openAnswerWindow() {
    this.answerWindowOpenSubject.next(true);
  }

  closeAnswerWindow() {
    this.answerWindowOpenSubject.next(false);
  }

  openChatWindow() {
    this.chatWindowOpenSubject.next(true);
  }

  closeChatWindow() {
    this.chatWindowOpenSubject.next(false);
  }

  openSideNav() {
    this.sideNavOpenSubject.next(true);
  }

  closeSideNav() {
    this.sideNavOpenSubject.next(false);
  }

  toggleSideNav() {
    const currentState = this.sideNavOpenSubject.value;
    this.sideNavOpenSubject.next(!currentState);
  }

  isAnyOpen(): boolean {
    return (
      this.channelWindowOpenSubject.getValue() ||
      this.answerWindowOpenSubject.getValue() ||
      this.chatWindowOpenSubject.getValue()
    );
  }
}
