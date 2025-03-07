import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-popup',
  imports: [CommonModule],
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss'],
})
export class ProfilePopupComponent implements OnInit {
  user = {
    name: 'Elise Roth',
    email: 'testmail@mailmail.com',
    status: 'offline',
  };

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.user = {
        name: 'Max Mustermann',
        email: 'max@example.com',
        status: 'offline',
      };
    }, 1000);
  }
}
