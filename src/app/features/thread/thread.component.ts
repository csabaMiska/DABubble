import { Component, inject } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [],
  providers: [WindowWidthDirective],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);

  closeThread() {
    this.dashboardService.closeThread();
    if (this.windowWidthDirective.tabletViewOn) {
      this.dashboardService.openChannel();
    }
  }
}
