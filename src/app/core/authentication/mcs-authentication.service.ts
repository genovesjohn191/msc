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
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { McsAuthenticationIdentity } from './mcs-authentication.identity';
import { AppState } from '../../app.service';
import { reviverParser } from '../../utilities';

@Injectable()
export class McsAuthenticationService {

  constructor(
    private _appState: AppState,
    private _cookieService: CookieService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity
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
    // TODO: Login redirection must be pass an encoded callback url
    //       auth url must also be in envvars
    let returnUrl = CoreDefinition.DEFAULT_INITIAL_PAGE;
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

    // Return token from the bearer snapshots
    if (routeParams) {
      authToken = routeParams[CoreDefinition.QUERY_PARAM_BEARER];
      if (authToken) { return authToken; }
    }

    // Return the token from the app state
    authToken = this._appState.get(CoreDefinition.APPSTATE_AUTH_TOKEN);
    if (authToken) { return authToken; }

    // Return the token from the cookie
    authToken = this._cookieService.get(CoreDefinition.COOKIE_AUTH_TOKEN);
    if (authToken) { return authToken; }
  }

  /**
   * This will set the token to Cookie and Appstate
   * @param authToken Valid Authentication Token
   */
  public setAuthToken(authToken: string): void {
    // Update cookie, appstate, and request for identity
    this._appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, authToken);
    this._requestForIdentity(authToken);
  }

  /**
   * This will delete the token to Cookie and Appstate
   */
  public deleteAuthToken(): void {
    // Delete the token from Appstate and Cookie
    this._cookieService.remove(CoreDefinition.COOKIE_AUTH_TOKEN);
    this._appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, undefined);
  }

  private _requestForIdentity(authToken: string): void {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/identity';
    mcsApiRequestParameter.optionalHeaders.append(
      CoreDefinition.HEADERS_AUTHORIZATION,
      `${CoreDefinition.HEADERS_BEARER} ${authToken}`
    );

    this._apiService.get(mcsApiRequestParameter)
      .map((response) => {
        let identityResponse: McsApiSuccessResponse<McsApiIdentity>;
        identityResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiIdentity>;

        return identityResponse;
      })
      .subscribe((identity) => {
        if (identity && identity.content) {
          this._appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, identity.content);
          this._authenticationIdentity.applyIdentity();
          this._setCookie(authToken, this._authenticationIdentity.expiry);
        }
      });
  }

  private _setCookie(authentication: string, expiration: Date): void {
    if (!expiration && !authentication) { return; }

    // Set cookie with expiration date
    this._cookieService.put(
      CoreDefinition.COOKIE_AUTH_TOKEN,
      authentication,
      { expires: expiration }
    );
  }

  private _listenForErrorApiResponse(): void {
    this._apiService.errorResponseStream.subscribe((error) => {
      if (!error) { return; }

      switch (error) {
        case McsHttpStatusCode.Unauthorized:
          this.deleteAuthToken();
          this.navigateToLoginPage();
          break;

        case McsHttpStatusCode.Forbidden:
          // TODO: Confirm if modal here or alert should be displayed
          break;

        default:
          break;
      }
    });
  }
}
