import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { combineLatest, forkJoin, of, switchMap, take } from 'rxjs';
import { SearchService } from '../../../shared/services/firebase/search/search.service';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { DashboardService } from '../../../shared/services/dashboard/dashboard.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { WindowWidthDirective } from '../../../shared/directives/window-width/window-width.directive';
import { MatDialog } from '@angular/material/dialog';
import { ChannelInfoDialogComponent } from '../../../features/channel-window/channel-info-dialog/channel-info-dialog.component';

@Component({
  selector: 'app-header-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ObjectPickerComponent
  ],
  providers: [WindowWidthDirective],
  templateUrl: './header-search-bar.component.html',
  styleUrl: './header-search-bar.component.scss'
})
export class HeaderSearchBarComponent {
  private searchService = inject(SearchService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private dashboardService = inject(DashboardService);
  private windowWidthDirective = inject(WindowWidthDirective);
  readonly dialog = inject(MatDialog);

  editableContentEmpty: boolean = true;
  objectSelectorIsOpen: boolean = false;
  inputRects: DOMRect = {} as DOMRect;

  searchTerm: string = '';
  filteredObjects: any[] = [];
  isLoading!: boolean;

  onSearchChange() {
    this.isLoading = true;
    const term = this.searchTerm.trim();

    if (term.length > 0) {
      this.objectSelectorIsOpen = true;
      const inputElement = document.querySelector('.search-input') as HTMLElement;
      this.inputRects = inputElement.getBoundingClientRect();
      this.firebaseAuthService.getCurrentUser().pipe(
        take(1),
        switchMap(user => {
          if (!user) {
            return of([]);
          }
          const currentUserUid = user.uid;
          return forkJoin([
            this.searchService.searchUser(term),
            this.searchService.searchChannel(term, currentUserUid),
            this.searchService.searchInChannels(term, currentUserUid)
          ]);
        })
      ).subscribe(([userResults, channelResult, contentResults]) => {
        this.filteredObjects = [...userResults, ...channelResult, ...contentResults];
        this.isLoading = false;
      });
    } else {
      this.objectSelectorIsOpen = false;
      this.filteredObjects = [];
    }
  }

  selectedObject(objectId: string, objectType: string) {
    if (objectType === 'user') {
      this.openChatOrChannelWindow(objectId, 'User');
    } else if (objectType === 'channel') {
      this.openChatOrChannelWindow(objectId, 'Channel');
    } else if (objectType === 'channel-description') {
      this.openChatOrChannelWindow(objectId, 'Channel');
      this.openChannelInfoDialog(objectId);
    } else if (objectType === 'channel-message') { 
      const pathSegments = objectId.split('/');
      const channelId = pathSegments?.[1];
      const messageId = pathSegments?.[2];
      this.openChatOrChannelWindow(channelId, 'Channel');
      this.scrollToMessage(messageId);
    }

    this.resetSearch();
  }

  openChatOrChannelWindow(uid: string, type: string) {
    this.channelService.setUserIdOrChannelId(uid);
    this.messageService.setMessageInfoId(uid, type);
    if (type === 'User') {
      this.openChatContainer();
    } else if (type === 'Channel') {
      this.openChannelContainer();
    }
  }

  openChannelInfoDialog(channelId: string) {
      const dialogRef = this.dialog.open(ChannelInfoDialogComponent, {
        width: '100vw',
        maxWidth: '872px',
        height: '100vh',
        maxHeight: '616px',
        data:{ channelId },
      });
    }

  resetSearch() {
    if (this.searchTerm) {
      this.searchTerm = '';
    }
    this.filteredObjects = [];
    this.objectSelectorIsOpen = false;
  }

  openChatContainer() {
    this.dashboardService.openChatWindow();
    this.dashboardService.closeChannelWindow();
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.toggleSideNav();
    }
  }

  openChannelContainer() {
    this.dashboardService.openChannelWindow();
    this.dashboardService.closeChatWindow();
    this.dashboardService.closeAnswerWindow();
    if (this.windowWidthDirective.mobilViewOn) {
      this.dashboardService.toggleSideNav();
    }
  }

  scrollToMessage(messageId: string): void {
    setTimeout(() => {
      const element = document.getElementById('message-' + messageId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1000);
  }

  calculateObjectSelectorPosition(inputRect: DOMRect) {
    if (!inputRect) return {};

    return {
      position: 'fixed',
      top: `${Math.max(0, inputRect.bottom - 16)}px`,
      left: `${Math.max(0, inputRect.left + 65)}px`
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.isClickInsideObjectSelector(event);
    if (!clickedInside) {
      this.objectSelectorIsOpen = false;
    }
  }

  isClickInsideObjectSelector(event: MouseEvent): boolean {
    const objectSelector = document.querySelector('app-object-picker');
    return objectSelector?.contains(event.target as Node) ?? false;
  }
}
