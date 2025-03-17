import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/channel.component';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from '../thread/thread.component';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { NewMessageComponent } from '../new-message/new-message.component';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChannelComponent,
    ThreadComponent,
    NewMessageComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  channelIsOpen: boolean = false;
  threadIsOpen: boolean = false;
  newMessageIsOpen: boolean = false;
  windowWidth: number = window.innerWidth;
  private resizeSubscription!: Subscription;

  ngOnInit() {
    this.dashboardService.channelIsOpen$.subscribe(isOpen => {
      this.channelIsOpen = isOpen;
    });
    this.dashboardService.threadIsOpen$.subscribe(isOpen => {
      this.threadIsOpen = isOpen;
    });
    this.dashboardService.newMessageIsOpen$.subscribe(isOpen => {
      this.newMessageIsOpen = isOpen;
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
      if (this.threadIsOpen) {
        this.dashboardService.openThread();
        this.dashboardService.closeChannel();
      } else {
        this.dashboardService.openChannel();
      }
      if (this.channelIsOpen) {
        this.dashboardService.openChannel();
      }
      if (this.newMessageIsOpen) {
        this.dashboardService.closeChannel();
        this.dashboardService.closeThread();
      }
    } else {
      this.dashboardService.openChannel();
      if (this.threadIsOpen) {
        this.dashboardService.openThread();
      }
      if (this.newMessageIsOpen) {
        this.dashboardService.closeChannel();
        this.dashboardService.closeThread();
      }
    }
  }

  toggleMobileVisibility() {
    if (this.windowWidth < 800) {
      if (this.threadIsOpen) {
        this.dashboardService.openThread();
        this.dashboardService.closeChannel();
        this.dashboardService.closeSideNav();
      } else {
        this.dashboardService.openChannel();
        this.dashboardService.closeSideNav();
      }
      if (this.channelIsOpen) {
        this.dashboardService.openChannel();
        this.dashboardService.closeSideNav();
      }
      if (this.newMessageIsOpen) {
        this.dashboardService.closeChannel();
        this.dashboardService.closeThread();
        this.dashboardService.closeSideNav();
      }
    } else {
      this.dashboardService.openChannel();
      this.dashboardService.closeSideNav();
      if (this.threadIsOpen) {
        this.dashboardService.openThread();
        this.dashboardService.closeSideNav();
      }
      if (this.newMessageIsOpen) {
        this.dashboardService.closeChannel();
        this.dashboardService.closeThread();
        this.dashboardService.closeSideNav();
      }
    }
  }
}
