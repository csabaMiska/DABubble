import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile-popup',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile-popup.component.html',
  styleUrl: './my-profile-popup.component.scss',
})
export class MyProfilePopupComponent implements OnInit {
  user = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    status: 'offline',
  };

  editingProfile = false;
  originalUser = { ...this.user }; // Speichern der ursprünglichen Benutzerdaten

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.user = {
        name: 'Elise Roth',
        email: 'testmail@mailmail.com',
        status: 'online',
      };
      this.originalUser = { ...this.user }; // Speichern der ursprünglichen Benutzerdaten bei Initialisierung
    }, 1000);
  }

  enableEditing() {
    this.editingProfile = true;
  }

  saveChanges(newName: string, newEmail: string) {
    if (newName.trim() || newEmail.trim()) {
      this.user.name = newName.trim();
      this.user.email = newEmail.trim();
      this.originalUser = { ...this.user }; // Setze originalUser auf den aktuellen Stand
    }
    this.editingProfile = false;
  }

  cancelEditing() {
    this.user = { ...this.originalUser }; // Zurücksetzen auf den aktuellen Zustand von originalUser
    this.editingProfile = false;
  }
}
