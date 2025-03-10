import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPassResetSharedModule } from './../../shared/material-module/mat-pass-reset.module';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatPassResetSharedModule, MatFormFieldModule, ReactiveFormsModule],
})
export class PasswordResetComponent {
  private fb = inject(FormBuilder);

  emailFormReset = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  errorMessage = signal('');

  constructor() {
    merge(
      this.emailFormReset.get('email')!.statusChanges,
      this.emailFormReset.get('email')!.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  private updateErrorMessage() {
    const emailControl = this.emailFormReset.get('email');

    if (emailControl?.hasError('required')) {
      this.errorMessage.set('Die E-Mail ist erforderlich.');
    } else if (emailControl?.hasError('email')) {
      this.errorMessage.set('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    } else {
      this.errorMessage.set('');
    }
  }
}
