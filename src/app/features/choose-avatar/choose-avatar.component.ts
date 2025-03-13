import { Component, inject } from '@angular/core';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-choose-avatar',
  imports: [MatSharedModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  private fb = inject(FormBuilder);
  avatarChosenForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Hier soll dann die Validierung für das Auswählen des Avatar Bildes sein, eben verpflichtend.
   */
  private initForm(): void {
    this.avatarChosenForm = this.fb.group({
      AvatarIcon: ['', [Validators.required]],
    });
  }
}
