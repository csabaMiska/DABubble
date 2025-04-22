import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { User } from '../../shared/interface/user.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';

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
export class UserCardComponent implements OnInit {
  private firebaseAuthservice = inject(FirebaseAuthService);

  @Input() user!: User;
  @Input() isSelectedUser: boolean = false;
  @Output() userRemoved = new EventEmitter<{ userUid: string }>();

  isCurrentUser: boolean = false;

  ngOnInit(): void {
    this.firebaseAuthservice.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.isCurrentUser = this.user.uid === currentUser.uid;
      }
    });
  }

  removeUser(userUid: string) {
    this.userRemoved.emit({ userUid });
    this.isSelectedUser = false;
  }
}
