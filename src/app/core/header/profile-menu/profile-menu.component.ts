import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

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

  openProfileDialog() {
    this.dialogRef.close();
    //hier kommt noch Logic rein was die Dialog öffnet
  }

  logOut() {
    this.dialogRef.close();
    //hier kommt die LogOut logic
  }
}
