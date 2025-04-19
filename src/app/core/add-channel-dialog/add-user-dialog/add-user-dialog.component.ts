import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { ObjectPickerComponent } from '../../object-picker/object-picker.component';
import { User } from '../../../shared/interface/user.model';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, take } from 'rxjs';
import { ChannelService } from '../../../shared/services/firebase/channel/channel.service';
import { Channel } from '../../../shared/interface/channal.model';
import { UserCardComponent } from '../../user-card/user-card.component';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    ObjectPickerComponent,
    UserCardComponent
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  private firebaseUserService = inject(FirebaseUserService);
  private channelService = inject(ChannelService);
  @ViewChild('editableDiv', { static: false }) editableDivRef!: ElementRef<HTMLElement>;

  selectedRadioValue: string = '1';
  showAddUsersInput: boolean = false;
  editableContentEmpty: boolean = true;

  inputRects: DOMRect = {} as DOMRect;
  objectSelectorIsOpen: boolean = false;

  channelId!: string;
  creatorUid!: string;
  channelTitle!: string;

  users$!: Observable<User[]>;
  filteredUsers: User[] = [];
  selectedUsers$ = new BehaviorSubject<string[]>([]);
  selectedUsersData$: Observable<User[]> = of([]);
  allUsers: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { channelId: string, creatorUid: string, channelTitle: string }) {
    this.channelId = data.channelId;
    this.creatorUid = data.creatorUid;
    this.channelTitle = data.channelTitle;
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getSelectedUsersByIds();
  }

  getAllUsers() {
    this.users$ = this.firebaseUserService.getUsers();
  }

  onRadioChange(event: MatRadioChange) {
    this.showAddUsersInput = this.selectedRadioValue === '2';
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
      this.selectedUsers$.pipe(take(1)).subscribe(selectedUsers => {
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

  closeAddUserDialog() {
    this.dialog.closeAll();
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
    const newSelected = [...this.selectedUsers$.value, userUid];
    this.selectedUsers$.next(newSelected);
    this.objectSelectorIsOpen = false;
    if (this.editableDivRef?.nativeElement) {
      this.editableDivRef.nativeElement.innerText = '';
    }
  }

  removeUserFromSelectedUsers(userUid: string) {
    const newSelected = this.selectedUsers$.value.filter(uid => uid !== userUid);
    this.selectedUsers$.next(newSelected);
  }

  addUsersToChannel() {
    if (this.selectedRadioValue === '1') {
      this.addAllUsersToChannel();
      this.closeAddUserDialog();
    } else if (this.selectedRadioValue === '2') {
      this.addSelectedUsersToChannel();
      this.closeAddUserDialog();
    }
  }

  addAllUsersToChannel() {
    this.users$.subscribe(users => {
      const allUsers = users.map(user => user.uid);
      const nonCreatorUsers = allUsers.filter(uid => uid !== this.creatorUid);
      const membersToAdd: { [uid: string]: { role: 'member' } } = {};

      nonCreatorUsers.forEach(uid => {
        membersToAdd[uid] = { role: 'member' };
      });

      this.channelService.addUserToChannel(this.channelId, {
        members: membersToAdd
      });
    });
  }

  addSelectedUsersToChannel() {
    const currentSelected = this.selectedUsers$.value;
    const membersToAdd: { [uid: string]: { role: 'member' } } = {};

    currentSelected.forEach(uid => {
      membersToAdd[uid] = { role: 'member' };
    });

    this.channelService.addUserToChannel(this.channelId, {
      members: membersToAdd
    });

    this.selectedUsers$.next([]);
  }

  getSelectedUsersByIds() {
    this.selectedUsersData$ = this.selectedUsers$.pipe(
      switchMap(userIds => {
        if (userIds.length === 0) return of([]);
        const userObservables = userIds.map(uid => this.firebaseUserService.getUserRealTime(uid));
        return combineLatest(userObservables);
      }),
      map(users => users.filter(Boolean) as User[])
    );
  }
}
