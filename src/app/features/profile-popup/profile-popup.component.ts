import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, switchMap, take } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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
  showMessageBtn: boolean = false;
  showEditUserForm: boolean = false;
  user$?: Observable<User | undefined>;

  constructor() {
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.getMyProfileDate();
  }

  getMyProfileDate(): void {
    this.user$ = this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.getUserRealTime(user.uid);
        }
        return [];
      })
    );
  }

  updateUserData() {
    const { name } = this.editUserForm.value;
    this.user$?.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.updateUser(user.uid, { name });
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

  closeProfileView() {
    this.profilePopupDialogRef.close();
  }

  enableEditing() {
    this.showEditUserForm = !this.showEditUserForm;
  }

}
