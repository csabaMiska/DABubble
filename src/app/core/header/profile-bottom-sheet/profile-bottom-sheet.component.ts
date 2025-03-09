import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-profile-bottom-sheet',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './profile-bottom-sheet.component.html',
  styleUrl: './profile-bottom-sheet.component.scss'
})
export class ProfileBottomSheetComponent {
  private bottomSheetRef = inject<MatBottomSheetRef<ProfileBottomSheetComponent>>(MatBottomSheetRef);

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  openProfileDialog() {
    this.bottomSheetRef.dismiss();
    //hier kommt noch Logic rein was die Dialog öffnet
  }

  logOut() {
    this.bottomSheetRef.dismiss();
    //hier kommt die LogOut logic
  }
}
