import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { DirectMessagesUserListComponent } from './direct-messages-user-list/direct-messages-user-list.component';
import { ChannelsListComponent } from './channels-list/channels-list.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';

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
    DirectMessagesUserListComponent,
    ChannelsListComponent,
    WorkspaceComponent
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
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private dashboardService = inject(DashboardService);
  private firebaseUserService = inject(FirebaseUserService);

  sideNavIsOpen: boolean = true;
  toggleButtonText: 'schließen' | 'öffnen' = 'schließen';

  ngOnInit() {
   this.checkSideNavPosition();
  }

  checkSideNavPosition() {
    this.dashboardService.sideNavIsOpen$.subscribe(isOpen => {
      this.sideNavIsOpen = isOpen;
    });
  }

  toggleSidenav() {
    this.dashboardService.toggleSideNav();
    this.updateToggleButton();
  }

  updateToggleButton() {
    if (this.sideNavIsOpen) {
      this.toggleButtonText = 'schließen';
    } else {
      this.toggleButtonText = 'öffnen';
    }
  }
}