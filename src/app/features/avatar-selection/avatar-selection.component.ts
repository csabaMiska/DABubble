import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';

@Component({
  selector: 'app-avatar-selection',
  imports: [MatSharedModule, FormsModule],
  templateUrl: './avatar-selection.component.html',
  styleUrls: ['./avatar-selection.component.scss'],
})
export class AvatarSelectionComponent {
  selectedAvatar: number | null = null;

  avatars = [
    { id: 1, src: 'assets/avatars/avatar1.png', alt: 'Avatar 1' },
    { id: 2, src: 'assets/avatars/avatar2.png', alt: 'Avatar 2' },
    { id: 3, src: 'assets/avatars/avatar3.png', alt: 'Avatar 3' },
    { id: 4, src: 'assets/avatars/avatar4.png', alt: 'Avatar 4' },
    { id: 5, src: 'assets/avatars/avatar5.png', alt: 'Avatar 5' },
  ];

  confirmSelection() {
    if (this.selectedAvatar) {
      // Hier kannst du eine Aktion ausführen, z.B. die Auswahl speichern
      console.log('Ausgewählter Avatar:', this.selectedAvatar);
    }
  }
}
