import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';


@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  loginForm: FormGroup;
  passwordError: string | null = null; 

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]] 
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
  
  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return; 
    }
  
    const enteredPassword = this.loginForm.value.password;
    const correctPassword = 'richtigesPasswort';
  
    if (enteredPassword !== correctPassword) {
      this.passwordError = 'Falsches Passwort. Bitte versuche es erneut.';
    } else {
      this.passwordError = null;
    }
  }
}
