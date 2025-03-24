import { Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { Router } from '@angular/router';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { StatusDialogComponent } from '../status-dialog/status-dialog.component';
import { Observable, switchMap } from 'rxjs';
import { User } from '../../../shared/interface/user.model';
import { ProfilePopupComponent } from '../../../features/profile-popup/profile-popup.component';

@Component({
  selector: 'app-profile-menu',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly profileMenuDialogRef = inject(MatDialogRef<ProfileMenuComponent>);
  private statusDialogRef?: MatDialogRef<StatusDialogComponent>;
  private profilePopupDialogRef?: MatDialogRef<ProfilePopupComponent>;
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private router = inject(Router);
  isButtonClicked: boolean = false;
  user$!: Observable<User | undefined>;

  ngOnInit(): void {
    this.user$ = this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.getUserRealTime(user.uid);
        }
        return [];
      })
    );

    this.profileMenuDialogRef.afterClosed().subscribe(() => {
      this.statusDialogRef?.close();
      this.profilePopupDialogRef?.close();
    });
  }

  openStatusDialog(): void {
    this.isButtonClicked = true;
    this.statusDialogRef = this.dialog.open(StatusDialogComponent, {
      position: { top: '126px', right: '20px' },
      autoFocus: false,
      hasBackdrop: false
    });

    this.statusDialogRef.afterClosed().subscribe(() => {
      this.isButtonClicked = false;
    });
  }

  openProfileDialog() {
    this.profilePopupDialogRef = this.dialog.open(ProfilePopupComponent, {
      position: { top: '126px', right: '20px' },
      autoFocus: false,
      hasBackdrop: false
    });
  }

  logOut() {
    this.firebaseAuthService.getCurrentUser().subscribe((user) => {
      if (user) {
        if (user.isAnonymous) {
          this.deleteGuestUserData(user.uid);
          this.deleteGustUserAuth(user);
        } else {
          this.logOutNormaAndGoogleUser(user.uid);
        }
      }
    });
  }

  deleteGuestUserData(uid:string) {
    this.firebaseUserService.deleteUser(uid);
    this.profileMenuDialogRef.close();
    this.firebaseAuthService.logout().subscribe({
      next: () => {
        this.navigateSignIn();
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  deleteGustUserAuth(user: any) {
    this.firebaseAuthService.deleteAnonymusUser(user).subscribe({
      next() {
        console.log('Gast user has been deleted.')
      },
      error(error) {
        console.error(error)
      },
    });
  }

  logOutNormaAndGoogleUser(uid:string) {
    this.firebaseUserService.updateUser(uid, { status: 'offline' }).subscribe({
      next: () => {
        this.profileMenuDialogRef.close();
        this.firebaseAuthService.logout().subscribe({
          next: () => {
            this.navigateSignIn();
          },
          error: (error) => {
            console.error('Logout error:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
    });
  }

  navigateSignIn(): void {
    this.router.navigate(['sign-in']);
  }
}
