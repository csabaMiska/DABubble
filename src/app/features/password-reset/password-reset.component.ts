import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialResetSharedModule } from '../../shared/material-module/password-reset/mat-reset.module';
@Component({
  selector: 'app-password-reset',
  imports: [MaterialResetSharedModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent {
  emailFormReset = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
