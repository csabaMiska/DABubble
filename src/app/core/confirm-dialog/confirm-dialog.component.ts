import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/services/message/message.service';
import { OverlayService } from '../../shared/services/overlay/overlay.service';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Channel } from '../../shared/interface/channal.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  readonly dialog = inject(MatDialog);
  private messageService = inject(MessageService);
  private overlayService = inject(OverlayService);
  private channelService = inject(ChannelService);

  channel$!: Observable<Channel>

  messageIdOrChannelId: string;
  confirmType: string;
  currentUserUid: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { messageIdOrChannelId: string, confirmType: string, currentUserUid: string }) {
    this.messageIdOrChannelId = data.messageIdOrChannelId;
    this.confirmType = data.confirmType;
    this.currentUserUid = data.currentUserUid;
    this.getChannelDate();
  }

  getChannelDate() {
    if (this.confirmType === 'deleteChannel' || this.confirmType === 'leaveChannel') {
      this.channel$ = this.channelService.getChannelById(this.messageIdOrChannelId);
    }
  }

  confirm(messageIdOrChannelId: string) {
    if (this.confirmType === 'deleteMessage') {
      this.messageService.setMessageDeleteId(messageIdOrChannelId);
      this.overlayService.showOverlay('Nachricht gelöscht!', true, 'delete_forever');
    } else if (this.confirmType === 'deleteChannel') {
      this.channelService.deleteChannel(messageIdOrChannelId);
      this.overlayService.showOverlay('Channel gelöscht!', true, 'delete_forever');
    } else if (this.confirmType === 'leaveChannel') {
      this.channelService.removeUserFromChannel(messageIdOrChannelId, this.currentUserUid);
      this.overlayService.showOverlay('Du hast den Channel verlassen.', true, 'logout');
    }
    this.closeConfirmDialog();
  }

  cancelConfirmation() {
    this.messageService.setMessageDeleteId(null);
    this.closeConfirmDialog();
  }

  closeConfirmDialog() {
    this.dialog.closeAll();
  }
}
