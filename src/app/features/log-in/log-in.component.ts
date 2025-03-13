import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  loginForm: FormGroup;
  passwordError: string | null = null;

  constructor(private fb: FormBuilder) {
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

  login(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.firebaseService.login(email, password).subscribe({
      next: () => {
        this.navigateToHome();
      },
      error: (error) => { // Hier kann noch jeder fehlerhafte Loginversuch protokolliert werden
        console.error(error);
        this.passwordError = 'Invalid email or password';
      }
    });
  }

  logInAnonymous(): void {
    this.firebaseService.loginanonymous().subscribe({
      next: () => {
        this.navigateToHome();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  logInWithGoogle(): void {
    this.firebaseService.loginwithgoogle().subscribe({
      next: () => {
        this.navigateToHome();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['home']);
  }
}
