import { Component, inject, OnInit } from '@angular/core';
import { ChannelComponent } from '../channel/channel.component';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from '../thread/thread.component';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { NewMessageComponent } from '../new-message/new-message.component';

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
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  channelIsOpen: boolean = false;
  threadIsOpen: boolean = false;
  newMessageIsOpen: boolean = false;

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
  }
}
