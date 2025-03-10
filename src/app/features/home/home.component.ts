import { Component, inject, ViewChild } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../core/header/header.component';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: FocusTrapFactory,
      useClass: ConfigurableFocusTrapFactory
    },
    WindowWidthDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);

  sideNavIsOpen: boolean = true;
  toggleButtonText: 'schließen' | 'öffnen' = 'schließen';

  toggleSidenav() {
    this.sideNavIsOpen = !this.sideNavIsOpen;
    this.updateToggleButton();
  }

  updateToggleButton() {
    if (this.sideNavIsOpen) {
      this.toggleButtonText = 'schließen';
    } else {
      this.toggleButtonText = 'öffnen';
    }
  }

  openChannel() {
    this.dashboardService.openChannel();
    this.dashboardService.closeNewMessage();
    this.dashboardService.closeThread();
    if (this.windowWidthDirective.mobilViewOn) {
      this.sidenav.toggle();
    }
  }

  openNewMessage() {
    this.dashboardService.openNewMessage();
    this.dashboardService.closeChannel();
    this.dashboardService.closeThread();
    if (this.windowWidthDirective.mobilViewOn) {
      this.sidenav.toggle();
    }
  }
}