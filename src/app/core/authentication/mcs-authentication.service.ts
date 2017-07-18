import { Injectable } from '@angular/core';
import {
  Router,
  Params,
  ActivatedRoute
} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { CookieService } from 'ngx-cookie';
import { CoreDefinition } from '../core.definition';
import { McsApiService } from '../services/mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { AppState } from '../../app.service';

@Injectable()
export class McsAuthenticationService {

  constructor(
    private _appState: AppState,
    private _cookieService: CookieService,
    private _apiService: McsApiService
  ) {
    // Listen for the error in API Response
    this._listenForErrorApiResponse();
  }

  /**
   * This will navigate to login page in case
   * the sign in is incorrect or token expired
   * the sign in is incorrect or token expired
   */
  public navigateToLoginPage(): boolean {
    // TODO: Login reirection must be pass an encoded callback url
    //       auth url must also be in envvars
    let returnUrl = '/servers';
    let authUrl = 'https://auth.macquariecloudservices.com?redirecturl=';
    window.location.href = (authUrl + returnUrl);
    return false;
  }

  /**
   * This will get the tokens from the following:
   * 1. Tokens from the Appstate
   * 2. Router Parameters for the bearer
   * 3. Token from the Cookie
   * @param routeParams Router parameters for the bearer
   */
  public getAuthToken(routeParams: Params): string {
    let authToken: string;

    // Return the token from the app state
    authToken = this._appState.get(CoreDefinition.APPSTATE_AUTH_TOKEN);
    if (authToken) { return authToken; }

    // Return token from the bearer snapshots
    if (routeParams) {
      authToken = routeParams[CoreDefinition.QUERY_PARAM_BEARER];
      if (authToken) { return authToken; }
    }

    // Return the token from the cookie
    authToken = this._cookieService.get(CoreDefinition.COOKIE_AUTH_TOKEN);
    if (authToken) { return authToken; }
  }

  /**
   * This will set the token to Cookie and Appstate
   * @param authToken Valid Authentication Token
   */
  public setAuthToken(authToken: string): void {
    // Update cookie and appstate
    this._cookieService.put(CoreDefinition.COOKIE_AUTH_TOKEN, authToken);
    this._appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, authToken);
  }

  /**
   * This will delete the token to Cookie and Appstate
   */
  public deleteAuthToken(): void {
    // Delete the token from Appstate and Cookie
    this._cookieService.remove(CoreDefinition.COOKIE_AUTH_TOKEN);
    this._appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, undefined);
  }

  private _requestForTokenDetails(): void {
    // TODO: Request for token details in API
    // and set the expiration date to cookie
    let authToken: string;
    authToken = this._appState.get(CoreDefinition.APPSTATE_AUTH_TOKEN);
    this._cookieService.put(CoreDefinition.COOKIE_AUTH_TOKEN, authToken,
      { expires: new Date() });
  }

  private _listenForErrorApiResponse(): void {
    this._apiService.errorResponseStream.subscribe((error) => {
      if (error && error.status === 401) {
        this.deleteAuthToken();
        this.navigateToLoginPage();
      }
    });
  }
}
