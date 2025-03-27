import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../shared/services/firebase/auth/firebase.auth.service';
import { ChatService } from '../../../shared/services/firebase/chat/chat.service';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Message } from '../../../shared/interface/message.model';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseUserService } from '../../../shared/services/firebase/user/firebase.user.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit {
  private firebaseAuthService = inject(FirebaseAuthService);
  private firebaseUserService = inject(FirebaseUserService);
  private chatService = inject(ChatService);
  messagesWithUserData$!: Observable<Array<Message & { senderData?: any }>>;
  isSender: boolean = false;

  ngOnInit(): void {
    this.messagesWithUserData$ = combineLatest([
      this.getCurrentUserUid(),
      this.chatService.receiverUid$
    ]).pipe(
      switchMap(([senderId, receiverId]) => {
        if (senderId && receiverId) {
          return this.getMessagesWithUserData(senderId, receiverId);
        } else {
          return of([]);
        }
      })
    );
  }

  getCurrentUserUid() {
    return this.firebaseAuthService.getCurrentUser().pipe(
      switchMap(user => (user ? [user.uid] : []))
    );
  }

  getMessagesWithUserData(senderId: string, receiverId: string) {
    return this.chatService.getMessages(senderId, receiverId).pipe(
      switchMap(messages => {
        if (messages.length === 0) return of([]);
        return this.enrichMessagesWithUserData(messages, senderId);
      })
    );
  }

  enrichMessagesWithUserData(messages: any[], senderId: string) {
    const uniqueSenderIds = [...new Set(messages.map(m => m.senderId))];
    return combineLatest([
      of(messages),
      combineLatest(uniqueSenderIds.map(uid =>
        this.firebaseUserService.getUserRealTime(uid)
      ))
    ]).pipe(
      map(([msgs, userData]) => {
        return msgs.map(message => ({
          ...message,
          senderData: userData.find(user => user!.uid === message.senderId),
          isSender: message.senderId === senderId 
        }));
      })
    )
  }
}

