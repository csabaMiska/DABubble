import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { LOCALE_ID } from '@angular/core';

// Register German locale data
registerLocaleData(localeDe, 'de', localeDeExtra);

// Add locale providers to your existing appConfig
const mergedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    { provide: LOCALE_ID, useValue: 'de' }  // Set German as default locale
  ]
};

bootstrapApplication(AppComponent, mergedConfig)
  .catch((err) => console.error(err));
