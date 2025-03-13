import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Analytics } from '@angular/fire/analytics';
import { logEvent } from 'firebase/analytics';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  loginForm: FormGroup;
  passwordError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private analytics: Analytics,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['konstantin.aksenov+firebase@dev2k.org', [Validators.required, Validators.email]],
      password: ['#DABubble398', [Validators.required, Validators.minLength(6)]],
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

  async onSubmit(loginMethod: string) {
    logEvent(this.analytics, 'login', { method: loginMethod });
    console.log(`Login event sent: ${loginMethod}`);

    if (loginMethod === 'email') {
      if (this.loginForm.invalid) {
        Object.keys(this.loginForm.controls).forEach((key) => {
          this.loginForm.get(key)?.markAsTouched(); // Eingabefelder als „berührt“ (touched)
        });
        return;
      }

      const { email, password } = this.loginForm.value; // Das Formular als Objekt.

      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        console.log('Login erfolgreich!', userCredential.user);
        // alert('Login erfolgreich!');

        // Weiterleitung zum Dashboard nach erfolgreichem Login
        this.router.navigate(['/home/']);
      } catch (error) {
        console.error('Login fehlgeschlagen:', error);
        this.passwordError = 'Falsche Anmeldedaten. Bitte versuche es erneut.';
        alert('Login fehlgeschlagen. Bitte versuche es erneut.');
      }
    } else if (loginMethod === 'google') {
      try {
        // Hier später Google-Login-Methode einfügen
        console.log('Google-Login gestartet');
        alert('Google-Login erfolgreich!');
      } catch (error) {
        console.error('Google-Login fehlgeschlagen:', error);
        alert('Google-Login fehlgeschlagen. Bitte versuche es erneut.');
      }
    }
  }
}
