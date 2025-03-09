import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialResetSharedModule } from '../../shared/material-module/password-reset/mat-reset.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-new',
  imports: [MaterialResetSharedModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './password-new.component.html',
  styleUrls: ['./password-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordNewComponent {
  passwordFormReset: FormGroup;
  hide = signal(true);  // Signal für Passwortsichtbarkeit

  constructor(private fb: FormBuilder) {
    this.passwordFormReset = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // Methode zur Überprüfung der Passwortübereinstimmung
  passwordsMatch(): boolean {
    return this.passwordFormReset.get('password')?.value === this.passwordFormReset.get('confirmPassword')?.value;
  }

  // Methode zum Umschalten der Passwortsichtbarkeit
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation(); // Verhindert das Event-Bubbling
  }

  // Für die Toggle-Funktion
  hidePassword(): boolean {
    return this.hide();
  }
}




