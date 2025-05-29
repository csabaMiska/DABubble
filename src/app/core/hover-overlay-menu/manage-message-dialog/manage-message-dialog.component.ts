import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../../shared/services/message/message.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-message-dialog',
  standalone: true,
  imports: [],
  templateUrl: './manage-message-dialog.component.html',
  styleUrl: './manage-message-dialog.component.scss'
})
export class ManageMessageDialogComponent {
  readonly dialog = inject(MatDialog);
  readonly manageMessageDialogRef = inject(MatDialogRef<ManageMessageDialogComponent>);

  private messageService = inject(MessageService);
  messageId: string;
  viewContext: 'message' | 'answer';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { messageId: string, viewContext: 'message' | 'answer' }) {
    this.messageId = data.messageId;
    this.viewContext = data.viewContext;
  }

  editMessage(messageId: string) {
    this.messageService.setMessageEditMode(messageId);
    this.closeDialog();
  }

  deleteMessage(messageId: string) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      hasBackdrop: true,
      data: { messageIdOrChannelId: messageId, confirmType: 'deleteMessage', currentUserUid: null },
    });
    this.closeDialog();
  }

  closeDialog() {
    this.manageMessageDialogRef.close();
  }

  dialogIsHovered(messageId: string) {
    this.messageService.setMessageIsHoveredId(`${this.viewContext}-${messageId}`);
  }

  dialogIsNotHovered() {
    this.messageService.setMessageIsHoveredId(null);
  }
}
