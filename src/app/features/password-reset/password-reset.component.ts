import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialResetSharedModule } from '../../shared/material-module/password-reset/mat-reset.module';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-password-reset',
  imports: [MaterialResetSharedModule, MatIconModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent {
  emailFormReset = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
