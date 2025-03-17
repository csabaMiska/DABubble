import { Component } from '@angular/core';
import { MatSharedModule } from './../../shared/material-module/mat-shared.module';
import { BtnBackSelectionComponent } from './../../future-modul/components/btn-back-selection/btn-back-selection.component';
import { BtnForwardSelectionComponent } from './../../future-modul/components/btn-forward-selection/btn-forward-selection.component';

@Component({
  selector: 'app-avatar-selection',
  imports: [
    MatSharedModule,
    BtnBackSelectionComponent,
    BtnForwardSelectionComponent,
  ],
  templateUrl: './avatar-selection.component.html',
  styleUrls: ['./avatar-selection.component.scss'],
})
export class AvatarSelectionComponent {
  selectedAvatar: number | null = null;
  buttonDisabled = false;

  avatars = [
    { id: 1, src: './assets/img/profile-images/profile-1.png', alt: 'Avatar 1' },
    { id: 2, src: './assets/img/profile-images/profile-2.png', alt: 'Avatar 2' },
    { id: 3, src: './assets/img/profile-images/profile-3.png', alt: 'Avatar 3' },
    { id: 4, src: './assets/img/profile-images/profile-4.png', alt: 'Avatar 4' },
    { id: 5, src: './assets/img/profile-images/profile-5.png', alt: 'Avatar 5' },
    { id: 5, src: './assets/img/profile-images/profile-6.png', alt: 'Avatar 6' },
  ];

  /**
   * Sets the selected avatar.
   * @param {number} avatarId - The ID of the selected avatar.
   */
  selectAvatar(avatarId: number) {
    this.selectedAvatar = avatarId;
  }

  /**
   * Returns the image source of the selected avatar.
   * If no avatar is selected, a default image is returned.
   * @returns {string} The image source of the selected avatar.
   */
  selectedAvatarSrc(): string {
    const avatar = this.avatars.find((a) => a.id === this.selectedAvatar);
    return avatar ? avatar.src : './assets/img/profile-images/profile-0.svg';
  }

  /**
   * Returns the name of the selected avatar.
   * Currently, a static name is returned.
   * @returns {string} The name of the selected avatar.
   */
  selectedAvatarName(): string {
    return 'Frederik Beck';
  }

  /**
   * Confirms the selected avatar and temporarily disables the confirm button.
   */
  confirmSelection() {
    if (this.selectedAvatar) {
      console.log('Ausgewählter Avatar:', this.selectedAvatar);
      this.disableButtonTemporarily();
    }
  }

  /**
   * Disables the confirm button temporarily for 5 seconds.
   */
  disableButtonTemporarily() {
    this.buttonDisabled = true;
    setTimeout(() => {
      this.buttonDisabled = false;
    }, 5000);
  }
}
