import { ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { FirebaseAuthService } from '../../shared/services/firebase/auth/firebase.auth.service';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OverlayComponent } from '../../core/overlay/overlay.component';
import { AvatarsListService } from '../../shared/services/avatars-list/avatars-list.service';
import { User } from "../../shared/interface/user.model";
import { FirebaseUserService } from '../../shared/services/firebase/user/firebase.user.service';

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
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private firebaseAuthService = inject(FirebaseAuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public avatarsListService = inject(AvatarsListService)
  private firebaseUserService = inject(FirebaseUserService);

  signUpFormCard: FormGroup;
  hide = signal(true);

  showOverlay: boolean = false;
  textOverlay: string = '';
  iconOvarlay: boolean = false;

  avatarsList: Array<string> = this.avatarsListService.avatarsList;
  formContainerSwitch: boolean = false;
  selectedAvatar: string = 'assets/img/profile-images/profile-0.png';
  userName: string = ''; 

  constructor() {
    this.signUpFormCard = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.signUpFormCard.get('name')?.valueChanges.subscribe(value => {
      this.userName = value;
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  signUp(): void {
    if (this.signUpFormCard.invalid) return;
    if (!this.formContainerSwitch) {
      this.formContainerSwitch = true;
    } else {
      const { email, password, name } = this.signUpFormCard.value;
      this.firebaseAuthService.register(email, password).subscribe({
        next: (userCredential) => {
          const user = userCredential.user;
          this.showOverlayAfterSubmit();
          this.signUpFormCard.reset();
          this.signUpFormCard.disable();
          this.addUser(user.uid, email, name);
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

  addUser(uid: string, email: string, name:string) {
    const newUser: Partial<User> = {
      uid: uid,
      name: name,
      email: email,
      avatar: this.selectedAvatar,
      status: 'offline'
    };
    return this.firebaseUserService.addUser(newUser);
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

  selectYourAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  navigateToSignIn(): void {
    this.router.navigate(['sign-in']);
  }

  navigateBackToForm(): void {
    this.formContainerSwitch = !this.formContainerSwitch;
  }
}
