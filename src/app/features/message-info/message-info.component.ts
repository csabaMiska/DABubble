import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../../shared/services/message/message.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';
import { filter, Observable } from 'rxjs';
import { Message } from '../../shared/interface/message.model';
import { User } from '../../shared/interface/user.model';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { Channel } from '../../shared/interface/channal.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-message-info',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './message-info.component.html',
  styleUrl: './message-info.component.scss'
})
export class MessageInfoComponent implements OnInit {
  private messageService = inject(MessageService);
  private channelService = inject(ChannelService);
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
      else if (messageInfo?.messegeType === 'Channel') {
        this.messageInfoType = 'Channel';
        this.messageInfos$ = this.channelService.getChannelById(messageInfo.messageId).pipe(
          filter((channel): channel is Channel => channel !== undefined)
        );
      }
    });
  }
}
