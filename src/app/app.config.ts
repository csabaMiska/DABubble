import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const mockFirebaseConfig = {
  apiKey: 'dummy-api-key',
  authDomain: 'dummy-auth-domain',
  projectId: 'dummy-project-id',
  storageBucket: 'dummy-storage-bucket',
  messagingSenderId: 'dummy-messaging-sender-id',
  appId: 'dummy-app-id',
  measurementId: 'dummy-measurement-id'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(mockFirebaseConfig)), // Verwende das Mock-Objekt hier
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideAnimationsAsync()
  ]
};