import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-my-profile-popup',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-popup.component.html',
  styleUrl: './my-profile-popup.component.scss',
})
export class MyProfilePopupComponent implements OnInit {
  user = {
    Name: '',
    mail: '',
    online: '',
  };

  editingProfile = false;
  originalUser = { ...this.user };

  constructor(
    private firebaseService: FirebaseService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const userData = await this.firebaseService.getUserData();

    if (userData) {
      this.user = { ...userData };
      this.originalUser = { ...this.user };
    }
  }

  enableEditing() {
    this.editingProfile = true;
  }

  async saveChanges(newName: string, newEmail: string) {
    let updatedData: any = {};

    if (newName.trim() && newName.trim() !== this.user.Name) {
      updatedData.Name = newName.trim();
    }
    if (newEmail.trim() && newEmail.trim() !== this.user.mail) {
      updatedData.mail = newEmail.trim();
    }

    if (Object.keys(updatedData).length > 0) {
      await this.firebaseService.updateUserData(updatedData);
      Object.assign(this.user, updatedData);
      this.originalUser = { ...this.user };
    }

    this.editingProfile = false;
  }

  cancelEditing() {
    this.user = { ...this.originalUser };
    this.editingProfile = false;
  }
}
