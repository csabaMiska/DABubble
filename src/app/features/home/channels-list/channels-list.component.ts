import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AddChannelDialogComponent } from '../../../core/add-channel-dialog/add-channel-dialog.component';
import { ChannelCardComponent } from '../../../core/channel-card/channel-card.component';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { Channel } from '../../../shared/interface/channal.model';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { DashboardService } from '../../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../../shared/directives/window-width/window-width.directive';
import { MessageService } from '../../../shared/services/message/message.service';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';

@Component({
  selector: 'app-channels-list',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatBadgeModule,
    ChannelCardComponent
  ],
  providers: [WindowWidthDirective],
  templateUrl: './channels-list.component.html',
  styleUrl: './channels-list.component.scss'
})
export class ChannelsListComponent implements OnInit {
  readonly panelOpenState = signal(false);
  readonly dialog = inject(MatDialog);
  private channelService = inject(ChannelService);
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);
  private messageService = inject(MessageService);
  private firebaseAuthService = inject(FirebaseAuthService);

  channels$!: Observable<Channel[]>;

  ngOnInit(): void {
    this.getChannelsList();
  }

  getChannelsList() {
    this.firebaseAuthService.getCurrentUser().pipe(
      take(1),
      switchMap(user => 
        this.channelService.getChannels().pipe(
          map(channels => 
            channels.filter(channel => 
              user && channel.members && channel.members[user.uid]
            )
          )
        )
      )
    ).subscribe(filteredChannels => {
      this.channels$ = of(filteredChannels);
    });
  }

  onAddChannelClick(event: MouseEvent) {
    event.stopPropagation();
    this.openAddChannelDialog();
  }

  openAddChannelDialog() {
    this.dialog.open(AddChannelDialogComponent, {
      width: '100vw',
      maxWidth: '872px',
      height: '100vh',
      maxHeight: '540px',
      autoFocus: false,
      hasBackdrop: true
    });
  }

  openChannel(channalId: string, type: string) {
    this.channelService.setUserIdOrChannelId(channalId);
    this.messageService.setMessageInfoId(channalId, type);
    this.openChannelContainer();
  }
  
  openChannelContainer() {
    this.dashboardService.openChannelWindow();
    this.dashboardService.closeChatWindow();
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.toggleSideNav();
    }
  }
}
