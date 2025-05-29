import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, filter, Observable, of, switchMap, take, tap } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard/dashboard.service';
import { WindowWidthDirective } from '../../shared/directives/window-width/window-width.directive';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { AvatarsListService } from '../../shared/services/avatars-list/avatars-list.service';

@Component({
  selector: 'app-profile-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    WindowWidthDirective,
  ],
  templateUrl: './profile-popup.component.html',
  styleUrl: './profile-popup.component.scss',
})
export class ProfilePopupComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly profilePopupDialogRef = inject(MatDialogRef<ProfilePopupComponent>);
  private fb = inject(FormBuilder);
  editUserForm: FormGroup;
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private dashboardService = inject(DashboardService);
  private channelService = inject(ChannelService);
  private windowWidthDirective = inject(WindowWidthDirective);
  public avatarsListService = inject(AvatarsListService);

  showMessageBtn: boolean = false;
  showEditUserForm: boolean = false;
  chooseNewAvatar: boolean = false;

  user$?: Observable<User | undefined>;
  selectedAvatar: string = '';
  avatarsList: Array<string> = this.avatarsListService.avatarsList;

  constructor(@Inject(MAT_DIALOG_DATA) public data: boolean) {
    this.showMessageBtn = data ?? false;
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    if (!this.showMessageBtn) {
      this.getMyProfileDate();
    } else {
      this.getUserDate();
    }
  }

  getMyProfileDate(): void {
    this.user$ = this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.getUserRealTime(user.uid).pipe(
            tap(userData => {
              this.selectedAvatar = userData?.avatar ?? '';
              this.editUserForm.patchValue({ name: userData?.name ?? '' });
            })
          );
        }
        return of(undefined);
      })
    );
  }

  getUserDate(): void {
    this.user$ = combineLatest([
      this.firebaseAuthService.getCurrentUser(),
      this.firebaseUserService.userIdToShowProfile$
    ]).pipe(
      switchMap(([currentUser, selectedUser]) =>
        this.firebaseUserService.getUserRealTime(selectedUser).pipe(
          tap(userData => {
            this.showMessageBtn = currentUser?.uid !== selectedUser;
            this.selectedAvatar = userData?.avatar ?? '';
            this.editUserForm.patchValue({ name: userData?.name ?? '' });
          })
        )
      )
    );
  }

  updateUserData() {
    const { name } = this.editUserForm.value;
    const newAvater = this.selectedAvatar;
    this.user$?.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.updateUser(user.uid, { name, avatar: newAvater });
        }
        return [];
      })
    ).subscribe({
      next: () => {
        this.closeProfileView();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  updateUserAvatar() {
    const newAvater = this.selectedAvatar;
    this.user$?.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.updateUser(user.uid, { avatar: newAvater });
        }
        return [];
      })
    ).subscribe({
      next: () => {
        this.enableAvatarSelection();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  openDirectChat(uid: string) {
    this.channelService.setUserIdOrChannelId(uid);
    this.openChatContainer();
  }

  openChatContainer() {
    this.profilePopupDialogRef.close();
    this.dashboardService.openChatWindow();
    this.dashboardService.closeChannelWindow();
    this.dashboardService.closeAnswerWindow();
  }

  closeProfileView() {
    this.profilePopupDialogRef.close();
  }

  enableEditing() {
    this.showEditUserForm = !this.showEditUserForm;
  }

  enableAvatarSelection() {
    this.chooseNewAvatar = !this.chooseNewAvatar;
  }

  selectYourAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }
}
