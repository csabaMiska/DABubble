import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Router } from '@angular/router';
import { OverlayComponent } from '../../core/overlay/overlay.component';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../shared/services/overlay/overlay.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSharedModule, ReactiveFormsModule, CommonModule],
})
export class PasswordResetComponent {
  private fb = inject(FormBuilder);
  private firebaseAuthService = inject(FirebaseAuthService);
  private overlayService = inject(OverlayService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  emailFormReset: FormGroup;
  resetError: string | null = null;

  constructor() {
    this.emailFormReset = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  resetPassword(): void {
    if (this.emailFormReset.invalid) return;

    const { email } = this.emailFormReset.value;
    this.firebaseAuthService.sendpasswordresetmail(email).subscribe({
      next: () => {
        this.showOverlayAfterSubmit();
        this.emailFormReset.reset();
        this.emailFormReset.disable();
        this.cdr.markForCheck();
      },
      complete: () => {
        setTimeout(() => {
          this.navigateToSignIn();
        }, 2500);
      },
      error: (error) => {
        console.error(error);
        this.resetError = error;
        this.setErrorInputStyleAndMessage();
        this.cdr.markForCheck();
      }
    });
  }

  setErrorInputStyleAndMessage() {
    this.emailFormReset.reset();
    this.emailFormReset.get('email')?.setErrors({ customError: true });
  }

  showOverlayAfterSubmit() {
    this.overlayService.showOverlay('E-Mail gesendet!', true, 'forward_to_inbox');
  }

  navigateToSignIn(): void {
    this.router.navigate(['sign-in']);
  }

}
