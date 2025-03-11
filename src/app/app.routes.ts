import { Routes } from '@angular/router';
import { LogInComponent } from './features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [];

// Später müssen wir noch die [AuthGuard] einrichten, dass ohne login die Home keine erreichen kann.
// Developer Mode lassen wir erst so einfach zu zwiechen die Seiten zu naviegieren muss mann nicht immer anmelden.
