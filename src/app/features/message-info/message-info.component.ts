import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../../shared/services/message/message.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { filter, Observable } from 'rxjs';
import { Message } from '../../shared/interface/message.model';
import { User } from '../../shared/interface/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-info',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './message-info.component.html',
  styleUrl: './message-info.component.scss'
})
export class MessageInfoComponent implements OnInit {
  private messageService = inject(MessageService);
  private firebaseUserService = inject(FirebaseUserService);

  messageInfoType: 'User' | 'Channel' | null = null;
  messageInfos$!: Observable<any>;

  ngOnInit(): void {
    this.messageService.messageInfoId$.subscribe(messageInfo => {
      if (messageInfo?.messegeType === 'User') {
        this.messageInfoType = 'User';
        this.messageInfos$ = this.firebaseUserService.getUserRealTime(messageInfo.messageId).pipe(
          filter((user): user is User => user !== undefined)
        );
      } 
      // else if (messageInfo?.messegeType === 'Channel') {
      //   this.messageInfo$ = this.firebaseChannelService.getChannelRealTime(messageInfo.messageId).pipe(
      //     filter((channel): channel is Message => channel! == undefined);
      //   )
      // }
    });
  }
}
