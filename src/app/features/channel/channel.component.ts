import { Component, inject } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [],
  providers: [WindowWidthDirective],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);

  openThread() {
    this.dashboardService.openThread();
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.closeChannel();
    }
  }
}
