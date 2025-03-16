import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';
import { OverlayComponent } from '../../core/overlay/overlay.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSharedModule, ReactiveFormsModule, OverlayComponent, CommonModule],
})
export class PasswordResetComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  emailFormReset: FormGroup;
  resetError: string | null = null;
  showOverlay: boolean = false;
  textOverlay: string = '';
  iconOvarlay: boolean = false;

  constructor() {
    this.emailFormReset = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnChanges(): void {
    this.showOverlay;
  }

  resetPassword(): void {
    if (this.emailFormReset.invalid) return;

    const { email } = this.emailFormReset.value;
    this.firebaseService.sendpasswordresetmail(email).subscribe({
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
    if (!this.showOverlay) {
      this.showOverlay = true;
      this.textOverlay = 'E-Mail gesendet';
      this.iconOvarlay = true;
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
