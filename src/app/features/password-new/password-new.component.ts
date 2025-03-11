import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPassNewSharedModule } from './../../shared/material-module/mat-pass-new.module';

@Component({
  selector: 'app-password-new',
  imports: [MatPassNewSharedModule, ReactiveFormsModule],
  templateUrl: './password-new.component.html',
  styleUrls: ['./password-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordNewComponent implements OnInit {
  private fb = inject(FormBuilder);
  passwordFormReset!: FormGroup;
  hide = signal(true); // Signal für Passwortsichtbarkeit

  ngOnInit(): void {
    this.initForm();
  }

  // Erstelle die Form als eine FormGrout, um die Passwort übereinstimmung zu Prüfen und setzen.
  private initForm(): void {
    this.passwordFormReset = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // Methode zur Überprüfung der Passwortübereinstimmung
  passwordsMatch(): boolean {
    return (
      this.passwordFormReset.get('password')?.value ===
      this.passwordFormReset.get('confirmPassword')?.value
    );
  }

  // Methode zum Umschalten der Passwortsichtbarkeit
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
