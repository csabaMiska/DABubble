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
  readonly dialogRef = inject(MatDialogRef<ProfileMenuComponent>);
  private statusDialogRef?: MatDialogRef<StatusDialogComponent>;
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

    this.dialogRef.afterClosed().subscribe(() => {
      this.statusDialogRef?.close();
    });
  }

  openStatusDialog(): void {
    this.isButtonClicked = true;
    this.statusDialogRef = this.dialog.open(StatusDialogComponent, {
      position: { top: '180px', right: '308px' },
      autoFocus: false,
      hasBackdrop: false
    });

    this.statusDialogRef.afterClosed().subscribe(() => {
      this.isButtonClicked = false;
    });
  }

  openProfileDialog() {
    this.dialogRef.close();
  }

  logOut() {
    this.firebaseAuthService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.firebaseUserService.updateUser(user.uid, { status: 'offline' }).subscribe({
          next: () => {
            this.dialogRef.close();
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
    });
  }

  navigateSignIn(): void {
    this.router.navigate(['sign-in']);
  }
}
