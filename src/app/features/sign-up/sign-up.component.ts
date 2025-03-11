import { Component, signal, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPassNewSharedModule } from './../../shared/material-module/mat-pass-new.module';

@Component({
  selector: 'app-sign-up',
  imports: [MatPassNewSharedModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  signUpFormCard!: FormGroup;
  hide = signal(true); // Signal für Passwortsichtbarkeit

  ngOnInit(): void {
    this.initForm();
  }

  // Erstelle die Form als eine FormGrout, um die Passwort übereinstimmung zu Prüfen und setzen.
  private initForm(): void {
    this.signUpFormCard = this.fb.group({
      confirmName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]], // E-Mail-Feld ergänzt
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  // // Methode zur Überprüfung der Passwortübereinstimmung
  // passwordsMatch(): boolean {
  //   return (
  //     this.signUpFormCard.get('password')?.value ===
  //     this.signUpFormCard.get('confirmPassword')?.value
  //   );
  // }

  // Methode zum Umschalten der Passwortsichtbarkeit
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  // Methode zur Validierung des Namens
  nameError(): string | null {
    const control = this.signUpFormCard.get('confirmName');
    if (control?.hasError('required')) {
      return 'Name ist erforderlich';
    }
    return null;
  }

  // Methode zur Validierung der E-Mail
  emailError(): string | null {
    const control = this.signUpFormCard.get('email');
    if (control?.hasError('required')) {
      return 'E-Mail ist erforderlich';
    }
    if (control?.hasError('email')) {
      return 'Ungültige E-Mail-Adresse';
    }
    return null;
  }

  // Methode zur Validierung des Passworts
  passwordError(): string | null {
    const control = this.signUpFormCard.get('password');
    if (control?.hasError('required')) {
      return 'Passwort ist erforderlich';
    }
    return null;
  }
}
