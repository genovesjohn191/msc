import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { CoreDefinition } from '../core.definition';
import { CoreConfig } from '../core.config';
import { McsCookieService } from '../services/mcs-cookie.service';
import { McsApiService } from '../services/mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { McsLoggerService } from '../services/mcs-logger.service';
import { AppState } from '../../app.service';
import {
  resolveEnvVar,
  isNullOrEmpty,
  getDomainName
} from '../../utilities';

@Injectable()
export class McsAuthenticationService {

  private _returnUrl: string; // Return url to be set privately
  private _jwtCookieName: string;
  private _enablePassingJwtInUrl: boolean;

  constructor(
    private _appState: AppState,
    private _cookieService: McsCookieService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _loggerService: McsLoggerService,
    private _locationService: Location,
    private _coreConfig: CoreConfig
  ) {
    // Listen for the error in API Response
    this._jwtCookieName = resolveEnvVar('JWT_COOKIE_NAME', CoreDefinition.COOKIE_AUTH_TOKEN);
    this._enablePassingJwtInUrl =
      resolveEnvVar('ENABLE_PASSING_JWT_IN_URL', 'true').toLowerCase() === 'true';
  }

  /**
   * This will navigate to login page of SSO (IDP)
   */
  public logIn(): void {
    if (isNullOrEmpty(this._coreConfig.loginUrl)) {
      throw new Error(`Invalid login url of ${this._coreConfig.loginUrl}`);
    }
    window.location.href = (this._coreConfig.loginUrl + this._returnUrl);
  }

  /**
   * This will navigate to logout page of SSO (IDP)
   */
  public logOut(): void {
    if (isNullOrEmpty(this._coreConfig.logoutUrl)) {
      throw new Error(`Invalid logout url of ${this._coreConfig.logoutUrl}`);
    }
    this.deleteCookieContent();
    window.location.href = this._coreConfig.logoutUrl;
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
      authToken = routeParams[CoreDefinition.QUERY_PARAM_BEARER];
      if (authToken) { return authToken; }
    }

    // Return the token from the cookie
    authToken = this._cookieService.getItem<string>(this._jwtCookieName);
    if (authToken) { return authToken; }
  }

  /**
   * This will set the token to Cookie and Appstate
   * @param authToken Valid Authentication Token
   */
  public setAuthToken(authToken: string, expiration: Date = null): void {
    // Update cookie
    this._setCookie(authToken, expiration);
  }

  /**
   * This will delete the content of the cookie that was created by MCS
   */
  public deleteCookieContent(): void {
    // Delete the token from Appstate and Cookie
    if (this._enablePassingJwtInUrl) {
      this._cookieService.removeItem(this._jwtCookieName);
    }
    this._cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
  }

  /**
   * This will set the return URL to be use when token is expired or null
   *
   * `@Note`This will remove also the bearer in case of existence
   * @param returnUrl Return url to be redirected
   */
  public setReturnUrl(returnUrl: string, queryParams: Params): void {
    this._returnUrl = this._removeBearer(returnUrl, queryParams);
  }

  /**
   * This will normalize the url and set the return url from the login page
   *
   * `@Note:`The return url should be set in the guard and this will
   * remove the bearer that was appended in the url
   */
  public normalizeUrl(): void {
    this._locationService.replaceState(this._locationService
      .normalize(this._returnUrl));
  }

  /**
   * Tries to get user identity based on JWT to verify if user is authenticated
   * Also updates the user identity in the app
   *
   * Returns true if user is authenticated, and false if otherwise
   */
  public IsAuthenticated(authToken: string): Observable<boolean> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/identity';
    mcsApiRequestParameter.optionalHeaders.set(
      CoreDefinition.HEADER_AUTHORIZATION,
      `${CoreDefinition.HEADER_BEARER} ${authToken}`
    );

    return this._apiService.get(mcsApiRequestParameter)
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsApiIdentity>(McsApiIdentity, response);

        if (apiResponse && apiResponse.content) {
          this._setUserIdentity(authToken, apiResponse.content);
          return true;
        }
        return false;
      });
  }

  private _setUserIdentity(authToken: string, identity: McsApiIdentity) {
    if (this._enablePassingJwtInUrl) {
      this.setAuthToken(authToken, identity.expiry);
    }
    this._appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, identity);
    this._authenticationIdentity.applyIdentity();
  }

  private _removeBearer(url: string, queryParams: Params): string {
    let modifiedUrl: string;
    let token = queryParams[CoreDefinition.QUERY_PARAM_BEARER];

    if (token) {
      modifiedUrl = url.replace(`${token}`, '');
      modifiedUrl = modifiedUrl.replace(`?${CoreDefinition.QUERY_PARAM_BEARER}=`, '');
      modifiedUrl = modifiedUrl.replace(`&${CoreDefinition.QUERY_PARAM_BEARER}=`, '');
    } else {
      modifiedUrl = url;
    }
    return modifiedUrl;
  }

  private _setCookie(token: string, expiry: Date): void {
    let invalidToken = isNullOrEmpty(token);
    if (invalidToken) { return; }

    let domainName = getDomainName(window.location.href);
    this._loggerService.trace('domain', domainName);
    this._loggerService.trace('token expiry', expiry);

    // Set cookie with expiration date
    this._cookieService.setItem(
      this._jwtCookieName,
      token,
      {
        domain: domainName,
        expires: expiry
      });
  }
}
