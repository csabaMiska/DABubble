import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-profile-popup',
  imports: [CommonModule],
  templateUrl: './my-profile-popup.component.html',
  styleUrl: './my-profile-popup.component.scss',
})
export class MyProfilePopupComponent implements OnInit {
  user = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    status: 'offline',
  };

  editingName = false;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.user = {
        name: 'Elise Roth',
        email: 'testmail@mailmail.com',
        status: 'online',
      };
    }, 1000);
  }

  enableEditing() {
    this.editingName = true;
  }

  saveName(newName: string) {
    if (newName.trim()) {
      this.user.name = newName.trim();
    }
    this.editingName = false;
  }
}
