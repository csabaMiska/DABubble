import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { UserCardComponent } from '../../user-card/user-card.component';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { User } from '../../../shared/interface/user.model';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';

@Component({
  selector: 'app-add-user-input',
  standalone: true,
  imports: [
    CommonModule,
    ObjectPickerComponent,
    UserCardComponent
  ],
  templateUrl: './add-user-input.component.html',
  styleUrl: './add-user-input.component.scss'
})
export class AddUserInputComponent {
  private firebaseUserService = inject(FirebaseUserService);
  private channelService = inject(ChannelService);
  @ViewChild('editableDiv', { static: false }) editableDivRef!: ElementRef<HTMLElement>;

  @Input() creatorUid!: string;
  @Input() channelId!: string;

  editableContentEmpty: boolean = true;
  objectSelectorIsOpen: boolean = false;
  inputRects: DOMRect = {} as DOMRect;

  users$!: Observable<User[]>;
  filteredUsers: User[] = [];
  selectedUsersData$: Observable<User[]> = of([]);

  ngOnInit(): void {
    this.getAllUsers();
    this.getSelectedUsersByIds();
  }

  getAllUsers() {
    this.users$ = this.channelService.users$;
  }

  getSelectedUsersByIds() {
    this.selectedUsersData$ = this.channelService.selectedUsers$.pipe(
      switchMap(userIds => {
        if (userIds.length === 0) return of([]);
        const userObservables = userIds.map(uid => this.firebaseUserService.getUserRealTime(uid));
        return combineLatest(userObservables);
      }),
      map(users => users.filter(Boolean) as User[])
    );
  }

  onEditableInput(element: HTMLElement) {
    this.editableContentEmpty = element.innerText.trim() === '';
    const text = element.innerText.trim();

    if (text.length > 0 && !this.objectSelectorIsOpen) {
      const rect = element.getBoundingClientRect();
      this.inputRects = rect;
      this.objectSelectorIsOpen = true;
      this.searchUser(text);
    } else if (text.length === 0 && this.objectSelectorIsOpen) {
      this.objectSelectorIsOpen = false;
    }
  }

  calculateObjectSelectorPosition(inputRect: DOMRect) {
    if (!inputRect) return {};
    let left = inputRect.left + 20;
    let top = inputRect.bottom - 10;

    return {
      position: 'fixed',
      top: `${Math.max(0, inputRect.bottom - 10)}px`,
      left: `${Math.max(0, inputRect.left + 20)}px`
    };
  }

  searchUser(text: string) {
    if (text.length > 0) {
      const userSearchTerm = text.toLowerCase();
      this.channelService.selectedUsers$.pipe(take(1)).subscribe(selectedUsers => {
        this.users$.pipe(take(1)).subscribe(users => {
          this.filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(userSearchTerm) &&
            user.uid !== this.creatorUid &&
            !selectedUsers.includes(user.uid)
          );
        });
      });
    } else {
      this.filteredUsers = [];
    }
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

  addUserToSelectedUsers(userUid: string) {
    const newSelected = [...this.channelService.selectedUsers$.value, userUid];
    this.channelService.selectedUsers$.next(newSelected);
    this.objectSelectorIsOpen = false;
    if (this.editableDivRef?.nativeElement) {
      this.editableDivRef.nativeElement.innerText = '';
    }
  }

  removeUserFromSelectedUsers(userUid: string) {
    const newSelected = this.channelService.selectedUsers$.value.filter(uid => uid !== userUid);
    this.channelService.selectedUsers$.next(newSelected);
  }
}
