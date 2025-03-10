import { Component, inject } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  private dashboardService = inject(DashboardService);

  closeThread() {
    this.dashboardService.closeThread();
  }
}
