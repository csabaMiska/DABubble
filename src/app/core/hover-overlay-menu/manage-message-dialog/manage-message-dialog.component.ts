import { Component, EventEmitter, Inject, inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChatService } from '../../../shared/services/firebase/chat/chat.service';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'app-manage-message-dialog',
  standalone: true,
  imports: [],
  templateUrl: './manage-message-dialog.component.html',
  styleUrl: './manage-message-dialog.component.scss'
})
export class ManageMessageDialogComponent {
  private messageService = inject(MessageService);
  readonly dialog = inject(MatDialog);
  private manageMessageDialogRef: { [key: string]: MatDialogRef<ManageMessageDialogComponent, any> } = {};
  messageId!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { messageId: string }) {
    this.messageId = data.messageId;
  }

  editMessage(messageId: string) {
    this.messageService.setMessageEditMode(messageId);
  }

  deleteMessage(messageId: string) {
    this.messageService.setMessageDeleteId(messageId);
  }

  closeManageMessageDialog(messageId: string) {
    this.dialog.closeAll();
  }

  dialogIsHovered(messageId: string) {
    this.messageService.setMessageIsHoveredId(messageId);
  }

  dialogIsNotHovered(messageId: string) {
    this.messageService.setMessageIsHoveredId(null);
  }
}
