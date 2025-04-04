import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { Observable, switchMap } from 'rxjs';
import { User } from '../../shared/interface/user.model';
import { ChatService } from '../../shared/services/firebase/chat/chat.service';
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Message } from '../../shared/interface/message.model';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MessageComponent,
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit, AfterViewChecked {
  private firebaseUserService = inject(FirebaseUserService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private chatService = inject(ChatService);

  readonly dialog = inject(MatDialog);
  private profilePopupDialogRef?: MatDialogRef<ProfilePopupComponent>;

  user$!: Observable<User | undefined>;
  showUserProfile: boolean = true;

  content: string = '';
  @ViewChild('messageTextarea') messageTextarea!: ElementRef;
  textareaShouldFocus = true;

  ngOnInit(): void {
    this.user$ = this.chatService.receiverUid$.pipe(
      switchMap(uid => this.firebaseUserService.getUserRealTime(uid))
    );
  }

  ngAfterViewChecked(): void {
    if (this.textareaShouldFocus) {
      setTimeout(() => {
        if (this.messageTextarea) {
          this.messageTextarea.nativeElement.focus();
          this.textareaShouldFocus = false;
        }
      });
    }
  }

  sendMessage(): void {
    this.firebaseAuthService.getCurrentUser().subscribe(user => {
      if (user) {
        const senderId = user.uid;
        this.chatService.receiverUid$.subscribe(receiverId => {
          if (receiverId) {
            const newMessage: Partial<Message> = {
              senderId: senderId,
              receiverId: receiverId,
              timestamp: new Date().toISOString(),
              content: this.content,
            };
            if (this.content.trim().length > 0) {
              this.chatService.sendMessage(senderId, receiverId, newMessage);
              this.content = '';
            }
          } else {
            console.error('Receiver ID is undefined');
          }
          return;
        });
      }
    });
  }

  openProfileDialog(uid: string) {
    this.chatService.setReceiverUid(uid);
    this.profilePopupDialogRef = this.dialog.open(ProfilePopupComponent, {
      autoFocus: false,
      hasBackdrop: true,
      data: this.showUserProfile
    });
  }

  handleEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent; 
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}