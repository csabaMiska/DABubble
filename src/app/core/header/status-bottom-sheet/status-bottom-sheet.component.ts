import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ProfileBottomSheetComponent } from '../profile-bottom-sheet/profile-bottom-sheet.component';


@Component({
  selector: 'app-status-bottom-sheet',
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './status-bottom-sheet.component.html',
  styleUrl: './status-bottom-sheet.component.scss'
})
export class StatusBottomSheetComponent {
  readonly bottomSheet = inject(MatBottomSheet);
  private statusBottomSheetRef = inject<MatBottomSheetRef<StatusBottomSheetComponent>>(MatBottomSheetRef);
  private profileBottomSheetRef?: MatBottomSheetRef<ProfileBottomSheetComponent>;
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);

  changeUserStatus(status: 'online' | 'offline' | 'busy' | 'away') {
    this.firebaseAuthService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.firebaseUserService.updateUser(user.uid, { status: status });
        this.statusBottomSheetRef.dismiss();
        this.profileBottomSheetRef = this.bottomSheet.open(ProfileBottomSheetComponent);
      }
    });
  }

  openLink(event: MouseEvent): void {
    this.statusBottomSheetRef.dismiss();
    event.preventDefault();
  }

}
