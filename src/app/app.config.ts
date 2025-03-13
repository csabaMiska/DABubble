import { ApplicationConfig, importProvidersFrom, inject, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FirebaseApp, initializeApp, initializeServerApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { firebaseConfig } from './firebase.config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LayoutModule } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { REQUEST } from '@nguniversal/express-engine/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => {
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        return initializeApp(firebaseConfig);
      }
      const request = inject(REQUEST, { optional: true });
      const authIdToken = request?.headers.authorization?.split("Bearer ")[1];
      return initializeServerApp(firebaseConfig, {
        authIdToken,
        releaseOnDeref: request || undefined
      });
    }),
    provideAuth(() => getAuth(inject(FirebaseApp))),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideMessaging(() => getMessaging()),
    provideAnimationsAsync(),
    importProvidersFrom(LayoutModule),
  ],
};
