import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-profile-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile-popup.component.html',
  styleUrl: './profile-popup.component.scss',
})
export class ProfilePopupComponent {
  showMessageBtn: boolean = false;
  showEditUserForm: boolean = false;


  enableEditing() {
    this.showEditUserForm = !this.showEditUserForm;
  }

}
