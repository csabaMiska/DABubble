import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private channelOpenSubject = new BehaviorSubject<boolean>(false);
  private threadOpenSubject = new BehaviorSubject<boolean>(false);
  private newMessageOpenSubject = new BehaviorSubject<boolean>(false);
  private sideNavOpenSubject = new BehaviorSubject<boolean>(true);

  channelIsOpen$ = this.channelOpenSubject.asObservable();
  threadIsOpen$ = this.threadOpenSubject.asObservable();
  newMessageIsOpen$ = this.newMessageOpenSubject.asObservable();
  sideNavIsOpen$ = this.sideNavOpenSubject.asObservable();

  openChannel() {
    this.channelOpenSubject.next(true);
  }

  closeChannel() {
    this.channelOpenSubject.next(false);
  }

  openThread() {
    this.threadOpenSubject.next(true);
  }

  closeThread() {
    this.threadOpenSubject.next(false);
  }

  openNewMessage() {
    this.newMessageOpenSubject.next(true);
  }

  closeNewMessage() {
    this.newMessageOpenSubject.next(false);
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
      this.channelOpenSubject.getValue() ||
      this.threadOpenSubject.getValue() ||
      this.newMessageOpenSubject.getValue()
    );
  }
}
