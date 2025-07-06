import { Routes } from '@angular/router';
import { LogInComponent } from './features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { HomeComponent } from './features/home/home.component';
import { PasswordResetComponent } from './features/password-reset/password-reset.component';
import { PasswordNewComponent } from './features/password-new/password-new.component';
import { VerifyEmailComponent } from './features/verify-email/verify-email.component';
import { AuthActionHandlerComponent } from './features/auth-action-handler/auth-action-handler.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'sign-in', component: LogInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'pass-reset', component: PasswordResetComponent },
  { path: 'auth-action', component: AuthActionHandlerComponent},
  { path: 'pass-new', component: PasswordNewComponent },
  { path: 'verify-email', component: VerifyEmailComponent},
  { path: 'impressum', component: ImpressumComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
          path: '',
          pathMatch: 'full',
        outlet: 'pageContentOutlet',
        component: DashboardComponent,
      },
      {
        path: 'dashboard',
        outlet: 'pageContentOutlet',
        component: DashboardComponent,
      }
    ],
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: '**', redirectTo: 'sign-in' },
];
