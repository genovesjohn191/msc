import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {
  NgModule,
  ErrorHandler
} from '@angular/core';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CookieModule } from 'ngx-cookie';

/**
 * Raven logger
 */
import {
  errorHandlerProvider,
  setUserIdentity
} from './app.logger';

/**
 * Platform and Environment providers/directives/pipes
 */
import { environment } from 'environments/environment';

/**
 * App is our top level component
 */
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState } from './app.service';

/**
 * Styling SASS
 */
import '../styles/base.scss';

/**
 * Routing
 */
import { routes } from './app.routes';

/**
 * MCS Portal Modules Declaration
 */
import {
  CoreModule,
  CoreConfig,
  McsAuthenticationIdentity
} from './core';
import {
  ConsolePageModule,
  DefaultPageModule
} from './page-layout';
import { SharedModule } from './shared';

/**
 * MCS Portal Utilities
 */
import { resolveEnvVar } from './utilities';

/**
 * Application-Wide Providers
 */
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

/**
 * Set Core Configuration based on environment variables
 */
export function coreConfig(): CoreConfig {
  return {
    apiHost: resolveEnvVar('API_HOST', API_URL),
    loginUrl: resolveEnvVar('LOGIN_URL', LOGIN_URL),
    logoutUrl: resolveEnvVar('LOGOUT_URL', LOGOUT_URL),
    imageRoot: resolveEnvVar('IMAGE_ROOT', IMAGE_URL),
    iconRoot: resolveEnvVar('ICON_ROOT', ICON_URL),
    enryptionKey: resolveEnvVar('EK', EK)
  } as CoreConfig;
}

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CookieModule.forRoot(),
    CoreModule.forRoot(coreConfig),
    SharedModule,
    ConsolePageModule,
    DefaultPageModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    environment.ENV_PROVIDERS,
    APP_PROVIDERS,
    { provide: ErrorHandler, useFactory: errorHandlerProvider }
  ]
})

export class AppModule {

  constructor(public authIdentityService: McsAuthenticationIdentity) {
    this.setRavenUserSettings();
  }

  /**
   * Set the user settings of RAVEN for each changes of the identity
   */
  public setRavenUserSettings(): void {
    this.authIdentityService.userChanged
      .subscribe((isChanged) => {
        if (isChanged) {
          setUserIdentity(
            this.authIdentityService.user.userId,
            `${this.authIdentityService.user.firstName} ${this.authIdentityService.user.lastName}`,
            this.authIdentityService.user.email
          );
        }
      });
  }
}
