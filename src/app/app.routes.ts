import { Routes } from '@angular/router';
import { LogInComponent } from './features/log-in/log-in.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { PrivacyPolicyComponent } from './features/privacy-policy/privacy-policy.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    // Componenten welche ohne Registration sehbar sind
    { path: 'login', component: LogInComponent },
    { path: 'signup', component: SignUpComponent},
    { path: 'impressum', component: ImpressumComponent},
    { path: 'privacy-policy', component: PrivacyPolicyComponent},

    // Componenten welche nur nach LogIn sehbar sind
    { 
        path: 'home', 
        component: HomeComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                outlet: 'pageContentOutlet',
                component: DashboardComponent
            },
            {
                path: 'dashboard',
                outlet: 'pageContentOutlet',
                component: DashboardComponent
            },
            {
                path: 'impressum',
                outlet: 'pageContentOutlet',
                component: ImpressumComponent
            },
            {
                path: 'privacy-policy',
                pathMatch: 'full',
                outlet: 'pageContentOutlet',
                component: PrivacyPolicyComponent
            },

        ]
    },
   
    // Ohne LogIn der normale <router-outlet> leitet zu LogIn component
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    // Nicht confiegurierte Seiten leitet auch zu LogIn component
    { path: '**', redirectTo: 'login' }
];

// Später müssen wir noch die [AuthGuard] einrichten, dass ohne login die Home keine erreichen kann.
// Developer Mode lassen wir erst so einfach zu zwiechen die Seiten zu naviegieren muss mann nicht immer anmelden.