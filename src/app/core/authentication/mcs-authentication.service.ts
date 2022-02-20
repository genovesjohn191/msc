import {
  forkJoin,
  of,
  Observable
} from 'rxjs';
import {
  map,
  switchMap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { AppState } from '@app/app.service';
import {
  McsFeatureFlag,
  McsIdentity
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { CoreConfig } from '../core.config';
import { McsCookieService } from '../services/mcs-cookie.service';
import { McsSessionService } from '../session/session.service';
import { McsAccessControlService } from './mcs-access-control.service';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';

@Injectable()
export class McsAuthenticationService {
  public isNewOAuthEnabled = false;

  constructor(
    private _appState: AppState,
    private _sessionService: McsSessionService,
    private _cookieService: McsCookieService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControl: McsAccessControlService,
    private _coreConfig: CoreConfig
  ) { }

  /**
   * This will navigate to login page of SSO (IDP)
   */
  public logIn(): void {
    if (isNullOrEmpty(this._coreConfig.loginUrl)) {
      throw new Error(`Invalid login url of ${this._coreConfig.loginUrl}`);
    }
    window.location.href = this._getLoginPath();
  }

  /**
   * This will navigate to logout page of SSO (IDP)
   */
  public logOut(): void {
    if (isNullOrEmpty(this._coreConfig.logoutUrl)) {
      throw new Error(`Invalid logout url of ${this._coreConfig.logoutUrl}`);
    }
    this.deleteCookieContent();
    window.location.href = this._getLogoutPath();
  }

  /**
   * Updates the login return url to be called by SSO
   * @param url Url to be set in returnl url
   */
  public updateLoginReturnUrl(url: string): void {
    this._appState.set(CommonDefinition.APPSTATE_RETURN_URL_KEY, url);
  }

  /**
   * This will get the tokens from the following:
   * 1. Router Parameters for the bearer (if provided)
   * 2. Token from the Cookie
   * @param routeParams Router parameters for the bearer
   */
  public getAuthToken(routeParams?: Params): string {
    let authToken: string;

    // Return token from the bearer snapshots
    if (routeParams) {
      authToken = routeParams[CommonDefinition.QUERY_PARAM_BEARER];
    }

    if (authToken) { return authToken; }
  }

  /**
   * This will delete the content of the cookie that was created by MCS
   */
  public deleteCookieContent(): void {
    this._cookieService.removeItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
  }

  /**
   * Tries to get user identity based on JWT to verify if user is authenticated
   * Also updates the user identity in the app
   *
   * Returns true if user is authenticated, and false if otherwise
   */
  public authenticateUser(): Observable<McsIdentity> {
    let combinedCalls = forkJoin([
      this._apiService.getPlatform(),
      this._apiService.getMetadataLinks()
    ]);

    return this._apiService.getIdentity().pipe(
      switchMap(identity => {
        if (isNullOrEmpty(identity)) { return of(null); }

        this._setUserIdentity(identity);
        this.isNewOAuthEnabled = this._accessControl.hasAccessToFeature(McsFeatureFlag.NewOAuth);
        if (identity?.isAnonymous) { return of(identity); }

        // Set extension trigger
        this.setExtensionTrigger(identity.expiry);

        return combinedCalls.pipe(
          map(([platform, links]) => {
            this._authenticationIdentity.setActivePlatform(platform);
            this._authenticationIdentity.setMetadataLinks(links.collection);
            return identity;
          })
        );
      })
    );
  }

  /**
   * Sets the user identity to cookie based on the provided user information
   * @param identity Currently login user information
   */
  private _setUserIdentity(identity: McsIdentity) {
    this._authenticationIdentity.setActiveUser(identity);
    this._cookieService.setItem(CommonDefinition.COOKIE_USER_STATE_ID, identity.hashedId);
  }

  /**
   * Get the login path based on the saved return url in the appstate
   */
  private _getLoginPath(): string {
    let _returnUrl = this._appState.get(CommonDefinition.APPSTATE_RETURN_URL_KEY);
    let _loginUrl = this._coreConfig.loginUrl;

    if (this.isNewOAuthEnabled) {
      _loginUrl = `${this._coreConfig.apiHost}/auth/login?source=`;
    }

    return `${_loginUrl}${_returnUrl}`;
  }

  private _getLogoutPath(): string {
    let _logoutUrl = this._coreConfig.logoutUrl;

    if (this.isNewOAuthEnabled) {
      _logoutUrl = `${this._coreConfig.apiHost}/auth/logout`;
    }

    return `${_logoutUrl}`;
  }

  private setExtensionTrigger(expiry: Date): void {
    if (isNullOrEmpty(expiry) || !this.isNewOAuthEnabled) { return; }

    let refreshTimeInSeconds = (expiry.getTime() - Date.now()) / 1000;
    let willExpiresSoon = refreshTimeInSeconds < 300;
    if (willExpiresSoon) {
      // Refresh immediately
      refreshTimeInSeconds = 1;
    } else {
      // Refresh 5 min before expiry
      refreshTimeInSeconds = refreshTimeInSeconds - 300;
    }

    let refreshTimeInMs = refreshTimeInSeconds * 1000;
    setTimeout(this.extendSession.bind(this), refreshTimeInMs);
  }

  private extendSession(): boolean {
    if (this._sessionService.sessionTimedOut) {
      return false;
    }

    if (this._sessionService.sessionIsIdle) {
      setTimeout(this.extendSession.bind(this), 1000);
      return false;
    }

    this._apiService.extendSession().subscribe(() => {
      this.authenticateUser().subscribe();
    }
    );

    return true;
  }
}
