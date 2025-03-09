import { Component, inject } from '@angular/core';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet, MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { ProfileBottomSheetComponent } from './profile-bottom-sheet/profile-bottom-sheet.component';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { HeaderSearchBarComponent } from './header-search-bar/header-search-bar.component';
import { CommonModule } from '@angular/common';


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

export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  readonly bottomSheet = inject(MatBottomSheet);
  private windowWidthDirective = inject(WindowWidthDirective);

  menuIsOpen: boolean = false;
  menuIcon: 'keyboard_arrow_down' | 'keyboard_arrow_up' = 'keyboard_arrow_down';
  userStatus: 'online' | 'offline' | 'busy' = 'offline';

  constructor() { this.userStatus = 'online'; }

  toogleMenus() {
    if (this.windowWidthDirective.mobilViewOn) {
      this.openBottomSheet();
    } else {
      this.openDialog();
    }
  }

  openDialog(): void {
    this.dialog.open(ProfileMenuComponent, {
      position: { top: '126px', right: '20px' },
      autoFocus: false
    });
    this.toggleMenuIcon();
    this.dialog.afterAllClosed.subscribe(() => {
      this.menuIsOpen = false;
      this.menuIcon = 'keyboard_arrow_down';
    });
  }

  openBottomSheet(): void {
    this.bottomSheet.open(ProfileBottomSheetComponent);
  }

  toggleMenuIcon() {
    this.menuIsOpen = !this.menuIsOpen;
    this.menuIcon = this.menuIsOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }
}
