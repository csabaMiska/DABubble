import { Routes } from '@angular/router';
import { LogInComponent } from './features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { HomeComponent } from './features/home/home.component';
import { PasswordResetComponent } from './features/password-reset/password-reset.component';
import { PasswordNewComponent } from './features/password-new/password-new.component';
import { ProfilePopupComponent } from './features/profile-popup/profile-popup.component';
import { MyProfilePopupComponent } from './features/my-profile-popup/my-profile-popup.component';

export const routes: Routes = [
  // Componenten welche ohne Registration sehbar sind
  { path: 'login', component: LogInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'pass-reset', component: PasswordResetComponent },
  { path: 'pass-new', component: PasswordNewComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'profile-popup', component: ProfilePopupComponent },
  { path: 'my-profile-popup', component: MyProfilePopupComponent },

  // Componenten welche nur nach LogIn sehbar sind
  {
    path: 'home',
    component: HomeComponent,
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
      },
      {
        path: 'impressum',
        outlet: 'pageContentOutlet',
        component: ImpressumComponent,
      },
      {
        path: 'privacy-policy',
        pathMatch: 'full',
        outlet: 'pageContentOutlet',
        component: PrivacyPolicyComponent,
      },
    ],
  },

  // Ohne LogIn der normale <router-outlet> leitet zu LogIn component
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Nicht confiegurierte Seiten leitet auch zu LogIn component
  { path: '**', redirectTo: 'login' },
];

// Später müssen wir noch die [AuthGuard] einrichten, dass ohne login die Home keine erreichen kann.
// Developer Mode lassen wir erst so einfach zu zwischen die Seiten zu naviegieren muss mann nicht immer anmelden.
