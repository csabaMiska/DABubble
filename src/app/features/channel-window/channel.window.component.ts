import { Component, inject } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';

@Component({
  selector: 'app-channel-window',
  standalone: true,
  imports: [],
  providers: [WindowWidthDirective],
  templateUrl: './channel-window.component.html',
  styleUrl: './channel-window.component.scss'
})
export class ChannelWindowComponent {
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);

  openThread() {
    this.dashboardService.openAnswerWindow();
    if (this.windowWidthDirective.tabletViewOn) {
      this.dashboardService.closeChannelWindow();
    }
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.closeChannelWindow();
    }
  }
}
