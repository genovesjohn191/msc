import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  Observable,
  forkJoin
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsFeatureFlag,
  McsIdentity
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { AppState } from '@app/app.service';
import { McsApiService } from '@app/services';
import { CoreConfig } from '../core.config';
import { McsCookieService } from '../services/mcs-cookie.service';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { McsAccessControlService } from './mcs-access-control.service';

@Injectable()
export class McsAuthenticationService {

  constructor(
    private _appState: AppState,
    private _cookieService: McsCookieService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
    private _authenticationIdentity: McsAuthenticationIdentity,
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
  public IsAuthenticated(): Observable<boolean> {
    let identityObservable = this._apiService.getIdentity();
    let platformObservable = this._apiService.getPlatform();

    return forkJoin([identityObservable, platformObservable]).pipe(
      map(results => {
        let identity = results[0];
        let platform = results[1];
        if (isNullOrEmpty(identity)) { return false; }
        this._setUserIdentity(identity);
        this._authenticationIdentity.setActivePlatform(platform);
        return true;
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
    if (this._accessControlService.hasAccessToFeature([McsFeatureFlag.OAuthV2])) {
      // TODO: new login path here
      // _loginUrl = '';
    }
    return `${_loginUrl}${_returnUrl}`;
  }

  private _getLogoutPath(): string {
    let _returnUrl = this._appState.get(CommonDefinition.APPSTATE_RETURN_URL_KEY);
    let _logoutUrl = this._coreConfig.logoutUrl;

    if (this._accessControlService.hasAccessToFeature([McsFeatureFlag.OAuthV2])) {
      // TODO: new logout path here
      // _logoutUrl = '';
    }

     return `${_logoutUrl}`;
  }
}
