import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';
import { Observable } from 'rxjs';
import { User } from '../../../shared/interface/user.model';

@Component({
  selector: 'app-direct-messages-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatBadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './direct-messages-user-list.component.html',
  styleUrl: './direct-messages-user-list.component.scss'
})
export class DirectMessagesUserListComponent implements OnInit {
  private firebaseUserService = inject(FirebaseUserService);
  readonly panelOpenState = signal(false);
  hidden = false;
  users$!: Observable<User[]>;

  ngOnInit(): void {
    this.users$ = this.firebaseUserService.getUsers();
  }

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
  }
}
