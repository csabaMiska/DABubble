import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIcon } from '@angular/material/icon';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { Router } from '@angular/router';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { Observable, switchMap } from 'rxjs';
import { StatusDialogComponent } from '../status-dialog/status-dialog.component';
import { User } from '../../../shared/interface/user.model';
import { CommonModule } from '@angular/common';
import { StatusBottomSheetComponent } from '../status-bottom-sheet/status-bottom-sheet.component';

@Component({
  selector: 'app-profile-bottom-sheet',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './profile-bottom-sheet.component.html',
  styleUrl: './profile-bottom-sheet.component.scss'
})
export class ProfileBottomSheetComponent implements OnInit {
  readonly bottomSheet = inject(MatBottomSheet);
  private bottomSheetRef = inject<MatBottomSheetRef<ProfileBottomSheetComponent>>(MatBottomSheetRef);
  private statusBottomSheetRef?: MatBottomSheetRef<StatusBottomSheetComponent>;
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private router = inject(Router);
  user$!: Observable<User | undefined>;
  isButtonClicked: boolean = false;

  ngOnInit(): void {
    this.user$ = this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          return this.firebaseUserService.getUserRealTime(user.uid);
        }
        return [];
      })
    );
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  openStatusDialog(): void {
    this.isButtonClicked = true;
    this.statusBottomSheetRef = this.bottomSheet.open(StatusBottomSheetComponent)

    this.statusBottomSheetRef.afterDismissed().subscribe(() => {
      this.isButtonClicked = false;
    });
  }

  openProfileDialog() {
    this.bottomSheetRef.dismiss();
    //hier kommt noch Logic rein was die Dialog öffnet
  }

  logOut() {
    this.bottomSheetRef.dismiss();
    this.firebaseAuthService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.firebaseUserService.updateUser(user.uid, { status: 'offline' }).subscribe({
          next: () => {
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
