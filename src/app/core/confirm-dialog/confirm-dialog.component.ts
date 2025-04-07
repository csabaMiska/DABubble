import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/services/message/message.service';
import { OverlayService } from '../../shared/services/overlay/overlay.service';

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
  messageId!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { messageId: string }) {
    this.messageId = data.messageId;
  }

  cancelDeleteMessage() {
    this.messageService.setMessageDeleteId(null);
    this.closeConfirmDialog();
  }

  confirmDeleteMessage(messageId: string) {
    this.messageService.setMessageDeleteId(messageId);
    this.overlayService.showOverlay('Nachricht gelöscht!', true, 'delete_forever');
    this.closeConfirmDialog();
  }

  closeConfirmDialog() {
    this.dialog.closeAll();
  }
}
