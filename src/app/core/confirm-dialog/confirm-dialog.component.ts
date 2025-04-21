import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/services/message/message.service';
import { OverlayService } from '../../shared/services/overlay/overlay.service';
import { ChannelService } from '../../shared/services/firebase/channel/channel.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  readonly dialog = inject(MatDialog);
  private messageService = inject(MessageService);
  private overlayService = inject(OverlayService);
  private channelService = inject(ChannelService);

  messageIdOrChannelId: string;
  isMessage: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { messageIdOrChannelId: string, isMessage: boolean }) {
    this.messageIdOrChannelId = data.messageIdOrChannelId;
    this.isMessage = data.isMessage;
  }

  cancelDeleteMessage() {
    this.messageService.setMessageDeleteId(null);
    this.closeConfirmDialog();
  }

  confirmDeleteMessage(messageIdOrChannelId: string) {
    console.log(this.isMessage);
    if (this.isMessage === true) {
      this.messageService.setMessageDeleteId(messageIdOrChannelId);
      this.overlayService.showOverlay('Nachricht gelöscht!', true, 'delete_forever');
      this.closeConfirmDialog();
    } else {
      this.channelService.deleteChannel(messageIdOrChannelId);
      this.overlayService.showOverlay('Channel gelöscht!', true, 'delete_forever');
      console.log('Das wird aufgerufen!')
      this.closeConfirmDialog();
    }
  }

  closeConfirmDialog() {
    this.dialog.closeAll();
  }
}
