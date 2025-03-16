import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  hide = signal(true);
  loginForm: FormGroup;
  loginError: string | null = null;
  emailVerified: Observable<boolean>;

  constructor() {
    this.emailVerified = this.firebaseService.emailVerified$;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login(): void {
    if (this.loginForm.invalid) return;
  
    const { email, password } = this.loginForm.value;
    this.firebaseService.login(email, password).subscribe({
      next: () => {
        this.firebaseService.emailVerified$.subscribe((emailVerified) => {
          if (emailVerified) {
            this.navigateTo('home');
          } else {
            this.loginError = 'Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie fortfahren.';
            this.setErrorInputStyleAndMessage();
          }
        });
      },
      error: (error) => {
        switch (error.code) {
          case 'auth/invalid-credential':
            this.loginError = 'Ups! Falsche E-Mail oder falsches Passwort. Versuche es erneut.';
            this.setErrorInputStyleAndMessage();
            break;
          case 'auth/too-many-requests':
            this.loginError = 'Zu viele fehlgeschlagene Versuche. Versuche es später erneut.';
            this.setErrorInputStyleAndMessage();
            break;
          default:
            this.loginError = 'Ein unerwarteter Fehler ist aufgetreten.';
            this.setErrorInputStyleAndMessage();
            break;
        }
      },
    });
  }

  setErrorInputStyleAndMessage() {
    this.loginForm.reset();
    this.loginForm.get('password')?.setErrors({ customError: true });
    this.loginForm.get('email')?.setErrors({ customError: true });
  }

  logInAnonymous(): void {
    this.firebaseService.loginanonymous().subscribe({
      next: () => {
        this.navigateTo('home');
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  logInWithGoogle(): void {
    this.firebaseService.loginwithgoogle().subscribe({
      next: () => {
        this.navigateTo('home');
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  navigateTo(page: 'home' | 'pass-reset' | 'sign-up'): void {
    this.router.navigate([page]);
  }
}
