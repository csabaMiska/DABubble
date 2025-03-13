import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';

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
export class ProfileMenuComponent {
  readonly dialogRef = inject(MatDialogRef<ProfileMenuComponent>);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  openProfileDialog() {
    this.dialogRef.close();
    //hier kommt noch Logic rein was die Dialog öffnet
  }

  logOut() {
    this.dialogRef.close();
    this.firebaseService.logout().subscribe({
      next: () => {
        this.navigateSignIn();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  navigateSignIn(): void {
    this.router.navigate(['sign-in']);
  }
}
