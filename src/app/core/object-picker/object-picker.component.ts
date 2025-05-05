import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { UserCardComponent } from '../user-card/user-card.component';
import { ChannelCardComponent } from '../channel-card/channel-card.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable } from 'rxjs';
import { Channel } from '../../shared/interface/channal.model';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';

@Component({
  selector: 'app-object-picker',
  standalone: true,
  imports: [
    CommonModule,
    UserCardComponent,
    ChannelCardComponent,
    MatProgressBarModule
  ],
  templateUrl: './object-picker.component.html',
  styleUrl: './object-picker.component.scss'
})
export class ObjectPickerComponent implements OnChanges {
  @Input() isLoading!: boolean;
  @Input() contents!: any[];
  @Output() selectedObject = new EventEmitter<{ objectId: string }>();

  private channelService = inject(ChannelService);
  private firebaseUserService = inject(FirebaseUserService);

  channelTitles = new Map<string, string>();
  userNames = new Map<string, string>();
  answerFromMap = new Map<string, string>();

  ngOnChanges(): void {
    this.contents.forEach(content => {
      if (content.type === 'channel-message') {
        this.getChannelTitles(content.data?.receiverId);
      } else if (content.type === 'chat-message') {
        this.getUserNames(content.data?.receiverId);
      } else if (content.type === 'channel-answer' || content.type === 'chat-answer') {
        const pathSegments = content.data.path.split('/');
        const answerType = pathSegments?.[0];
        const answerFrom = pathSegments?.[1];
        const messageId = content.data?.messageId;
        if (messageId && answerFrom) {
          if (answerType === 'channels') {
            this.getChannelTitles(answerFrom);
            this.answerFromMap.set(messageId, answerFrom);
          } else if (answerType === 'chats') {
            const pathSegments = answerFrom.split('_');
            let receiverId: string = '';
            if (pathSegments?.[0] === content.data.senderUid) {
              receiverId = pathSegments?.[1];
            } else {
              receiverId = pathSegments?.[0];
            }
            this.answerFromMap.set(messageId, receiverId);
            this.getUserNames(receiverId);
          }
        }
      }
    });
  }

  getChannelTitles(channelId: string) {
    if (channelId) {
      this.channelService.getChannelById(channelId).subscribe(channel => {
        if (channel && channel.title) {
          this.channelTitles.set(channelId, channel.title);
        }
      }); 
    }
  }

  getUserNames(userId: any) {
    if (userId) {
      this.firebaseUserService.getUserRealTime(userId).subscribe(user => {
        if (user && user.name) {
          this.userNames.set(userId, user.name);
        }
      }); 
    }
  }

  selectUser(objectId: string) {
    this.selectedObject.emit({ objectId });
  }
}
