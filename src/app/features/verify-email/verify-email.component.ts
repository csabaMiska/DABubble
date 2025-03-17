import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { OverlayComponent } from '../../core/overlay/overlay.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    OverlayComponent,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firebaseAuthService = inject(FirebaseAuthService);
  private cdr = inject(ChangeDetectorRef);
  oobCode: string | null = null;
  confirmEmailText: boolean = false;
  errorMessage: boolean = false;
  email: string = '';
  showOverlay: boolean = false;
  textOverlay: string = '';
  iconOvarlay: boolean = false;

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (!this.oobCode) {
      this.router.navigate(['/']);
      return;
    }

    this.firebaseAuthService.checkactionmail(this.oobCode).subscribe({
      next: (info) => {
        this.email = info.email || "Unbekantes email."
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = true;
      }
    });
  }

  emailVerification() {
    if (this.oobCode) {
      this.firebaseAuthService.emailverification(this.oobCode).subscribe({
        next: () => {
          this.confirmEmailText = true;
          this.showOverlayAfterSubmit();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error)
          this.errorMessage = true;
        }
      })
    }
  }

  showOverlayAfterSubmit() {
    if (!this.showOverlay) {
      this.showOverlay = true;
      this.textOverlay = 'E-Mail erfolgreich bestätigt';
      this.iconOvarlay = false;
      setTimeout(() => {
        this.showOverlay = false;
        this.cdr.markForCheck();
      }, 1800);
    }
  }

  navigateToSignIn() {
    this.router.navigate(['sign-in']);
  }
}