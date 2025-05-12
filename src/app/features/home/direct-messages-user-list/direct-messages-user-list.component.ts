import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { Observable } from 'rxjs';
import { User } from '../../../shared/interface/user.model';
import { DashboardService } from '../../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../../shared/directives/window-width/window-width.directive';
import { MessageService } from '../../../shared/services/message/message.service';
import { UserCardComponent } from '../../../core/user-card/user-card.component';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';

@Component({
  selector: 'app-direct-messages-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatBadgeModule,
    UserCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './direct-messages-user-list.component.html',
  styleUrl: './direct-messages-user-list.component.scss'
})
export class DirectMessagesUserListComponent implements OnInit {
  private firebaseUserService = inject(FirebaseUserService);
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);

  readonly panelOpenState = signal(false);
  hidden = false;
  users$!: Observable<User[]>;

  ngOnInit(): void {
    this.users$ = this.firebaseUserService.getUsers();
  }

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }

  openDirectChat(uid: string, type: string) {
    this.channelService.setUserIdOrChannelId(uid);
    this.messageService.setMessageInfoId(uid, type);
    this.openChatContainer();
  }

  openChatContainer() {
    this.dashboardService.openChatWindow();
    this.dashboardService.closeChannelWindow();
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.toggleSideNav();
    }
  }
}
