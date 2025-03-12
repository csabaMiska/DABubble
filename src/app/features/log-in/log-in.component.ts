import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { FirebaseError } from 'firebase/app';

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

  constructor(private fb: FormBuilder,  private auth: Auth, private router: Router, private firestore: Firestore) {
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
  
  async onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }
  
    const { email, password } = this.loginForm.value;
  
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        this.passwordError = `Fehler: ${error.message}`; 
      } else {
        this.passwordError = 'Ein unbekannter Fehler ist aufgetreten.';
      }
    }
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
  
    try {
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Fehler bei der Google-Anmeldung:', error);
    }
  }
}
