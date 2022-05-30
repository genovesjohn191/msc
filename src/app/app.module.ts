import '../styles/base.scss';

import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  LoggerConfig,
  LoggerModule
} from '@peerlancers/ngx-logger';

import { McsApiClientConfig } from './api-client/mcs-api-client.config';
import { McsApiClientModule } from './api-client/mcs-api-client.module';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AppState } from './app.service';
import {
  CoreConfig,
  CoreModule,
  McsCookieService
} from './core';
import { EventBusModule } from './event-bus';
import { ServicesModule } from './services';
import { SharedModule } from './shared';
import {
  createObject,
  isNullOrEmpty,
  resolveEnvVar,
  CommonDefinition,
  Guid,
  McsEnvironmentVariables
} from './utilities';

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
    macviewManageUsersUrl: resolveEnvVar(McsEnvironmentVariables.MacviewManageUsersUrl),
    termsAndConditionsUrl: resolveEnvVar(McsEnvironmentVariables.McsTermsAndConditionsUrl),
    inviewUrl: resolveEnvVar(McsEnvironmentVariables.McsInviewUrl),
    trendDsmUrl: resolveEnvVar(McsEnvironmentVariables.McsTrendDsmUrl),
    knowledgeBaseUrl: resolveEnvVar(McsEnvironmentVariables.KnowledgeBaseUrl),
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

    SharedModule
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
