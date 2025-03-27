import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeDe, 'de', localeDeExtra);

const mergedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    { provide: LOCALE_ID, useValue: 'de' } 
  ]
};

bootstrapApplication(AppComponent, mergedConfig)
  .catch((err) => console.error(err));
