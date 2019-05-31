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
import { environment } from 'environments/environment';
import { AppComponent } from './app.component';
import { AppState } from './app.service';
import { appRoutes } from './app.routes';
import {
  CoreModule,
  CoreConfig,
  CoreDefinition,
  McsCookieService
} from './core';
import { EventBusModule } from './event-bus';
import { ServicesModule } from './services';
import {
  ConsolePageModule,
  DefaultPageModule
} from './page-layout';
import { PageNotificationsModule } from './page-notifications';
import { FeaturesSharedModule } from './features-shared';
import { SharedModule } from './shared';
import {
  resolveEnvVar,
  isNullOrEmpty
} from './utilities';
import { McsApiClientConfig } from './api-client/mcs-api-client.config';
import { McsApiClientModule } from './api-client/mcs-api-client.module';

import '../styles/base.scss';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    macviewUrl: resolveEnvVar('MACVIEW_URL', MACVIEW_URL),
    loginUrl: resolveEnvVar('LOGIN_URL', LOGIN_URL),
    logoutUrl: resolveEnvVar('LOGOUT_URL', LOGOUT_URL),
    macviewOrdersUrl: resolveEnvVar('MACVIEW_ORDERS_URL', MACVIEW_ORDERS_URL),
    macviewChangePasswordUrl: resolveEnvVar('MACVIEW_CHANGE_PASSWORD_URL',
      MACVIEW_CHANGE_PASSWORD_URL),
    imageRoot: resolveEnvVar('IMAGE_ROOT', IMAGE_URL),
    iconRoot: resolveEnvVar('ICON_ROOT', ICON_URL),
    enryptionKey: resolveEnvVar('EK', EK)
  } as CoreConfig;
}

export function apiClientConfig(cookieService: McsCookieService): McsApiClientConfig {
  let activeAccount = cookieService.getEncryptedItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
  let apiClientHeaders = new Map<string, string>();

  apiClientHeaders.set(CoreDefinition.HEADER_ACCEPT, 'application/json');
  apiClientHeaders.set(CoreDefinition.HEADER_CONTENT_TYPE, 'application/json');
  apiClientHeaders.set(CoreDefinition.HEADER_API_VERSION, '1.0');
  if (!isNullOrEmpty(activeAccount)) {
    apiClientHeaders.set(CoreDefinition.HEADER_COMPANY_ID, activeAccount as any);
  }

  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    headers: apiClientHeaders
  } as McsApiClientConfig;
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

    FeaturesSharedModule,
    SharedModule,
    ConsolePageModule,
    DefaultPageModule,
    PageNotificationsModule
  ],
  providers: [
    environment.ENV_PROVIDERS,
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
