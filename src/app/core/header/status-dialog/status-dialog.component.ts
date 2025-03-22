import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';


@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './status-dialog.component.html',
  styleUrl: './status-dialog.component.scss'
})
export class StatusDialogComponent {
  readonly dialogStatus = inject(MatDialogRef<StatusDialogComponent>);
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);

  changeUserStatus(status: 'online' | 'offline' | 'busy' | 'away') {
    this.firebaseAuthService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.firebaseUserService.updateUser(user.uid, { status: status });
        this.dialogStatus.close();
      }
    });
  }
}
