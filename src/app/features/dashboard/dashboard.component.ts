import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChannelWindowComponent } from '../channel-window/channel.window.component';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { AnswerWindowComponent } from '../answer-window/answer-window.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChannelWindowComponent,
    AnswerWindowComponent,
    ChatWindowComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  channelWindowIsOpen: boolean = false;
  answerWindowIsOpen: boolean = false;
  chatWindowIsOpen: boolean = false;
  windowWidth: number = window.innerWidth;
  private resizeSubscription!: Subscription;

  ngOnInit() {
    this.dashboardService.channelWindowIsOpen$.subscribe(isOpen => {
      this.channelWindowIsOpen = isOpen;
    });
    this.dashboardService.answerWindowIsOpen$.subscribe(isOpen => {
      this.answerWindowIsOpen = isOpen;
    });
    this.dashboardService.chatWindowIsOpen$.subscribe(isOpen => {
      this.chatWindowIsOpen = isOpen;
    });
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.windowWidth = window.innerWidth;
        this.toggleTabletVisibility();
        this.toggleMobileVisibility();
      });
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  toggleTabletVisibility() {
    if (this.windowWidth < 1200) {
      if (this.answerWindowIsOpen) {
        this.dashboardService.openAnswerWindow();
        this.dashboardService.closeChannelWindow();
      } else {
        this.dashboardService.openChannelWindow();
      }
      if (this.channelWindowIsOpen) {
        this.dashboardService.openChannelWindow();
      }
      if (this.chatWindowIsOpen) {
        this.dashboardService.closeChannelWindow();
        this.dashboardService.closeAnswerWindow();
      }
    } else {
      this.dashboardService.openChannelWindow();
      if (this.answerWindowIsOpen) {
        this.dashboardService.openAnswerWindow();
      }
      if (this.chatWindowIsOpen) {
        this.dashboardService.closeChannelWindow();
        this.dashboardService.closeAnswerWindow();
      }
    }
  }

  toggleMobileVisibility() {
    if (this.windowWidth < 800) {
      if (this.answerWindowIsOpen) {
        this.dashboardService.openAnswerWindow();
        this.dashboardService.closeChannelWindow();
        this.dashboardService.closeSideNav();
      } else {
        this.dashboardService.openChannelWindow();
        this.dashboardService.closeSideNav();
      }
      if (this.channelWindowIsOpen) {
        this.dashboardService.openChannelWindow();
        this.dashboardService.closeSideNav();
      }
      if (this.chatWindowIsOpen) {
        this.dashboardService.closeChannelWindow();
        this.dashboardService.closeAnswerWindow();
        this.dashboardService.closeSideNav();
      }
    } else {
      this.dashboardService.openChannelWindow();
      this.dashboardService.closeSideNav();
      if (this.answerWindowIsOpen) {
        this.dashboardService.openAnswerWindow();
        this.dashboardService.closeSideNav();
      }
      if (this.chatWindowIsOpen) {
        this.dashboardService.closeChannelWindow();
        this.dashboardService.closeAnswerWindow();
        this.dashboardService.closeSideNav();
      }
    }
  }
}
