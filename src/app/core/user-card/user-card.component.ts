import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../shared/interface/user.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() isSelectedUser: boolean = false;
  @Output() userRemoved = new EventEmitter<{ userUid: string }>();

  removeUser(userUid: string) {
    this.userRemoved.emit({ userUid });
    this.isSelectedUser = false;
  }
}
