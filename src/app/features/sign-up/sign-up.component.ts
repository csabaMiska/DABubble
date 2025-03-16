import { ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OverlayComponent } from '../../core/overlay/overlay.component';

@Component({
  selector: 'app-sign-up',
  imports: [
    MatSharedModule, 
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatCheckboxModule,
    OverlayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  signUpFormCard: FormGroup;
  hide = signal(true);
  showOverlay: boolean = false;
  textOverlay: string = '';
  iconOvarlay: boolean = false;

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor() {
    this.signUpFormCard = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  signUp(): void {
    if (this.signUpFormCard.invalid) return;

    const { email, password } = this.signUpFormCard.value;
    this.firebaseService.register(email, password).subscribe({
      next: () => {
        this.showOverlayAfterSubmit();
        this.signUpFormCard.reset();
        this.signUpFormCard.disable();
        this.cdr.markForCheck();
      },
      complete: () => {
        setTimeout(() => {
          this.navigateToSignIn();
        }, 2500);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  showOverlayAfterSubmit() {
    if (!this.showOverlay) {
      this.showOverlay = true;
      this.textOverlay = 'Konto erfolgreich erstellt!';
      this.iconOvarlay = false;
      setTimeout(() => {
        this.showOverlay = false;
        this.cdr.markForCheck();
      }, 1800);
    }
  }

  navigateToSignIn(): void {
    this.router.navigate(['sign-in']);
  }
}
