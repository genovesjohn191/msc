import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  LoggerModule,
  LoggerConfig
} from '@peerlancers/ngx-logger';
import { EventBusModule } from '@peerlancers/ngx-event-bus';

import { AppComponent } from './app.component';
import { AppState } from './app.service';
import { appRoutes } from './app.routes';
import {
  CoreModule,
  CoreConfig,
  McsCookieService
} from './core';
import { ServicesModule } from './services';
import {
  ConsolePageModule,
  DefaultPageModule,
  MaintenancePageModule,
  SystemMessagePageModule
} from './page-layout';
import { FeaturesSharedModule } from './features-shared';
import { SharedModule } from './shared';
import {
  resolveEnvVar,
  isNullOrEmpty,
  McsEnvironmentVariables,
  CommonDefinition,
  Guid,
  createObject
} from './utilities';
import { McsApiClientConfig } from './api-client/mcs-api-client.config';
import { McsApiClientModule } from './api-client/mcs-api-client.module';

import '../styles/base.scss';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?id=${Guid.newGuid().toString()}`);
}

export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar(McsEnvironmentVariables.ApiHost),
    macviewUrl: resolveEnvVar(McsEnvironmentVariables.MacviewUrl),
    loginUrl: resolveEnvVar(McsEnvironmentVariables.LoginUrl),
    logoutUrl: resolveEnvVar(McsEnvironmentVariables.LogoutUrl),
    macviewOrdersUrl: resolveEnvVar(McsEnvironmentVariables.MacviewOrdersUrl),
    macviewChangePasswordUrl: resolveEnvVar(McsEnvironmentVariables.MacviewChangePasswordUrl),
    termsAndConditionsUrl: resolveEnvVar(McsEnvironmentVariables.McsTermsAndConditionsUrl),
    inviewUrl: resolveEnvVar(McsEnvironmentVariables.McsInviewUrl),
    imageRoot: resolveEnvVar(McsEnvironmentVariables.ImageRoot),
    iconRoot: resolveEnvVar(McsEnvironmentVariables.IconRoot),
    enryptionKey: resolveEnvVar(McsEnvironmentVariables.Ek)
  } as CoreConfig;
}

export function apiClientConfig(cookieService: McsCookieService): McsApiClientConfig {
  let activeAccount = cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
  let apiClientHeaders = new Map<string, string>();

  apiClientHeaders.set(CommonDefinition.HEADER_ACCEPT, 'application/json');
  apiClientHeaders.set(CommonDefinition.HEADER_CONTENT_TYPE, 'application/json');
  apiClientHeaders.set(CommonDefinition.HEADER_API_VERSION, '1.0');
  if (!isNullOrEmpty(activeAccount)) {
    apiClientHeaders.set(CommonDefinition.HEADER_COMPANY_ID, activeAccount as any);
  }

  return createObject(McsApiClientConfig, {
    apiHost: resolveEnvVar(McsEnvironmentVariables.ApiHost),
    headers: apiClientHeaders,
    enableMockApi: false
  });
}

export function loggerConfig(cookieService: McsCookieService): LoggerConfig {
  let loggerFlag = cookieService.getEncryptedItem(CommonDefinition.COOKIE_ENABLE_LOGGER);
  return { enableLogging: loggerFlag || false } as LoggerConfig;
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    EventBusModule.forRoot(),
    ServicesModule.forRoot(),

    CoreModule.forRoot(coreConfig),
    McsApiClientModule.forRoot(apiClientConfig, [McsCookieService]),
    LoggerModule.forRoot(loggerConfig, [McsCookieService]),

    FeaturesSharedModule,
    SharedModule,
    ConsolePageModule,
    MaintenancePageModule,
    SystemMessagePageModule,
    DefaultPageModule
  ],
  providers: [
    AppState
  ]
})

export class AppModule {

  constructor(private _translateService: TranslateService) {
    this._initializeLanguage();
  }

  /**
   * Sets the default language to english
   */
  private _initializeLanguage(): void {
    this._translateService.setDefaultLang('en');
    this._translateService.use('en');
  }
}
