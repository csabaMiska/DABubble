import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';

import { FirebaseAuthService } from '../../shared/services/firebase-auth/firebase-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LogInComponent {
  loginForm: FormGroup;
  passwordError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firebaseAuthService: FirebaseAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailErrors(): ValidationErrors | null {
    return this.email?.errors ?? null;
  }

  get passwordErrors(): ValidationErrors | null {
    return this.password?.errors ?? null;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      await this.firebaseAuthService.signInWithEmailAndPassword(
        email,
        password
      );
      console.log('Login erfolgreich!');
      this.passwordError = null; // Setze den Fehler zurück
      // Hier kannst du den Nutzer zur Dashboard-Seite weiterleiten, z. B. mit Router.navigate(['/dashboard'])
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      this.passwordError = 'Falsche E-Mail oder falsches Passwort.';
    }
  }
}
