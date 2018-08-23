import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CoreDefinition } from '../core.definition';
import { CoreConfig } from '../core.config';
import { McsCookieService } from '../services/mcs-cookie.service';
import { McsApiService } from '../services/mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { AppState } from '../../app.service';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class McsAuthenticationService {

  private _returnUrl: string; // Return url to be set privately

  constructor(
    private _appState: AppState,
    private _cookieService: McsCookieService,
    private _apiService: McsApiService,
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
    }

    if (authToken) { return authToken; }
  }

  /**
   * This will delete the content of the cookie that was created by MCS
   */
  public deleteCookieContent(): void {
    this._cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
  }

  /**
   * Tries to get user identity based on JWT to verify if user is authenticated
   * Also updates the user identity in the app
   *
   * Returns true if user is authenticated, and false if otherwise
   */
  public IsAuthenticated(): Observable<boolean> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/identity';

    return this._apiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsApiIdentity>(McsApiIdentity, response);

          if (apiResponse && apiResponse.content) {
            this._setUserIdentity(apiResponse.content);
            return true;
          }
          return false;
        })
      );
  }

  private _setUserIdentity(identity: McsApiIdentity) {
    this._appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, identity);
    this._authenticationIdentity.applyIdentity();
    this._cookieService.setItem(
      CoreDefinition.COOKIE_USER_STATE_ID, this._authenticationIdentity.user.hashedId);
  }

  private _getLoginPath(): string {
    this._returnUrl = '?returnurl=' + this._appState.get(CoreDefinition.APPSTATE_RETURN_URL_KEY);
    return this._coreConfig.loginUrl + this._returnUrl;
  }
}
