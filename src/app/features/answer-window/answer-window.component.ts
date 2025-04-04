import { Component, inject } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';

@Component({
  selector: 'app-answer-window',
  standalone: true,
  imports: [],
  providers: [WindowWidthDirective],
  templateUrl: './answer-window.component.html',
  styleUrl: './answer-window.component.scss'
})
export class AnswerWindowComponent {
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);

  closeThread() {
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.tabletViewOn) {
      this.dashboardService.openChannelWindow();
    }
  }
}
