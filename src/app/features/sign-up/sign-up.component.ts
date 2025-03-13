import { Component, signal, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [MatSharedModule, ReactiveFormsModule, MatPseudoCheckboxModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService); // FirebaseService wird injiziert
  private router = inject(Router); // Router wird injiziert
  signUpFormCard!: FormGroup;
  hide = signal(true); // Signal für Passwortsichtbarkeit

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signUpFormCard = this.fb.group({
      confirmName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]],
    });
  }

  // Methode zum Umschalten der Passwortsichtbarkeit
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  signUp(): void {
    if (this.signUpFormCard.invalid) return;

    const { email, password } = this.signUpFormCard.value;
    this.firebaseService.register(email, password).subscribe({
      next: () => {
        this.navigateToSignIn();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  navigateToSignIn(): void {
    this.router.navigate(['sign-in']);
  }
}
