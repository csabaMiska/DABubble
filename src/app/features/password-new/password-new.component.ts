import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSharedModule } from '../../shared/material-module/mat-shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { error } from 'console';
import { OverlayComponent } from '../../core/overlay/overlay.component';

@Component({
  selector: 'app-password-new',
  imports: [MatSharedModule, ReactiveFormsModule, OverlayComponent],
  templateUrl: './password-new.component.html',
  styleUrls: ['./password-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordNewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private firebaseAuthService = inject(FirebaseAuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  passwordFormReset: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  passwordDoNotMatch: string | null = null;
  oobCode: string | null = null;
  errorMessage: string = '';
  showOverlay: boolean = false;
  textOverlay: string = '';
  iconOvarlay: boolean = false;

  constructor() {
    this.passwordFormReset = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    if (!this.oobCode) {
      this.errorMessage = "Ungültiger Passwort-Wiederherstellungslink.";
      this.passwordFormReset.disable();
      return
    }

    this.firebaseAuthService.verifycode(this.oobCode).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error(error);
        switch (error.code) {
          case 'auth/invalid-action-code':
            this.errorMessage = 'Ungültiger Passwort-Wiederherstellungslink.';
            this.passwordFormReset.disable();
            break;
          default:
            this.errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
            this.passwordFormReset.disable();
            break;
        }
      }
    });
  }

  showPassword(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }

  showConfirmPassword(event: MouseEvent) {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
    event.stopPropagation();
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  resetPassword() {
    if (this.passwordFormReset.hasError('passwordMismatch')) {
      this.passwordDoNotMatch = 'The passwords do not match';
      this.setErrorInputStyleAndMessage();
    }

    const { password } = this.passwordFormReset.value;
    if (this.oobCode) {
      this.firebaseAuthService.resetpassword(this.oobCode, password).subscribe({
        next: () => {
          this.showOverlayAfterSubmit();
          this.passwordFormReset.reset();
          this.passwordFormReset.disable();
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
  }

  showOverlayAfterSubmit() {
    if (!this.showOverlay) {
      this.showOverlay = true;
      this.textOverlay = 'Passwort zurückgesetzt';
      this.iconOvarlay = false;
      setTimeout(() => {
        this.showOverlay = false;
        this.cdr.markForCheck();
      }, 1800);
    }
  }

  setErrorInputStyleAndMessage() {
    this.passwordFormReset.get('confirmPassword')?.setErrors({ customError: true });
  }

  navigateToSignIn() {
    this.router.navigate(['sign-in'])
  }
}
