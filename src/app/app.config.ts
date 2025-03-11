import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { firebaseConfig } from './firebase.config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LayoutModule } from '@angular/cdk/layout';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), 
    // provideFirebaseApp(() =>
    //   initializeApp({
    //     projectId: firebaseConfig.projectId,
    //     appId: firebaseConfig.appId,
    //     storageBucket: firebaseConfig.storageBucket,
    //     apiKey: firebaseConfig.apiKey,
    //     authDomain: firebaseConfig.authDomain,
    //     messagingSenderId: firebaseConfig.messagingSenderId,
    //     measurementId: firebaseConfig.measurementId,
    //   })
    // ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideMessaging(() => getMessaging()),
    provideAnimationsAsync(),
    importProvidersFrom(LayoutModule),
  ],
};
