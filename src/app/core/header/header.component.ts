import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ProfileBottomSheetComponent } from './profile-bottom-sheet/profile-bottom-sheet.component';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { HeaderSearchBarComponent } from './header-search-bar/header-search-bar.component';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { User } from '../../shared/interface/user.model';
import { Observable, switchMap } from 'rxjs';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBottomSheetModule,
    HeaderSearchBarComponent,
  ],
  providers: [WindowWidthDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly bottomSheet = inject(MatBottomSheet);
  private windowWidthDirective = inject(WindowWidthDirective);
  private dashboardService = inject(DashboardService);
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);

  menuIsOpen: boolean = false;
  menuIcon: 'keyboard_arrow_down' | 'keyboard_arrow_up' = 'keyboard_arrow_down';
  workSpaceLogoIsVisible: boolean = false;
  @Output() toggleSidenav = new EventEmitter<void>();
  user$?: Observable<User | undefined>;

  ngOnInit() {
    this.getCurrentUser();
    this.dashboardService.channelIsOpen$.subscribe(() => this.updateWorkSpaceLogoVisibility());
    this.dashboardService.threadIsOpen$.subscribe(() => this.updateWorkSpaceLogoVisibility());
    this.dashboardService.newMessageIsOpen$.subscribe(() => this.updateWorkSpaceLogoVisibility());
  }

  getCurrentUser(): void {
    this.user$ = this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.getUserRealTime(user.uid);
        }
        return [];
      })
    );
  }

  updateWorkSpaceLogoVisibility() {
    if (this.windowWidthDirective.mobilViewOn) {
      this.workSpaceLogoIsVisible = this.dashboardService.isAnyOpen();
    } else {
      this.workSpaceLogoIsVisible = false;
    }
  }

  handleSidenavToggle() {
    this.toggleSidenav.emit();
    this.workSpaceLogoIsVisible = false;
  }

  toogleMenus() {
    if (this.windowWidthDirective.mobilViewOn) {
      this.openBottomSheet();
    } else {
      this.openDialog();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ProfileMenuComponent, {
      position: { top: '126px', right: '20px' },
      autoFocus: false,
    });
    this.toggleMenuIcon();
    dialogRef.afterClosed().subscribe(() => {
      this.menuIsOpen = false;
      this.menuIcon = 'keyboard_arrow_down';
    });
  }

  openBottomSheet(): void {
    this.bottomSheet.open(ProfileBottomSheetComponent, {
      autoFocus: false
    });
  }

  toggleMenuIcon() {
    this.menuIsOpen = !this.menuIsOpen;
    this.menuIcon = this.menuIsOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }
}
