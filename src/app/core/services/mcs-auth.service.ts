import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CookieService } from 'ngx-cookie';
import { AppState } from '../../app.service';
import { McsUserType } from '../enumerations/mcs-user-type.enum';
import { CoreDefinition } from '../core.definition';
import { RedirectService } from './redirect.service';

@Injectable()
export class McsAuthService {

  private _userName: string;
  private _userType: McsUserType;

  constructor(
    public appState: AppState,
    private _redirectService: RedirectService,
    private _router: Router,
    private _cookieService: CookieService
  ) {
    this._userName = 'Arrian';
    this._userType = McsUserType.Admin;
  }

  public get authToken(): string {
    // Get auth token in app state if available
    let authToken = this.appState.get(CoreDefinition.APPSTATE_AUTH_TOKEN);
    if (authToken) {
      return authToken;
    } else {
      return this._getAuthentication();
    }
  }

  public set authToken(authToken: string) {
    // Update cookie
    this._cookieService.put(CoreDefinition.COOKIE_AUTH_TOKEN, authToken);

    // Update app state
    this.appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, authToken);
  }

  public navigateToLoginPage() {
    // TODO: Login reirection must be pass an encoded callback url
      //       auth url must also be in envvars
    let returnUrl = this._router.url;
    let authUrl = 'https://auth.macquariecloudservices.com?redirecturl=';
    this._redirectService.redirect(authUrl + returnUrl);
  }

  /**
   * GET: User Name
   */
  public get userName(): string {
    return this._userName;
  }

  /**
   * GET: User Type(User, Admin)
   */
  public get userType(): McsUserType {
    return this._userType;
  }

  private _getAuthentication() {
    // Try to get auth token from browser cookie
    let authToken = this._cookieService.get(CoreDefinition.COOKIE_AUTH_TOKEN);

    // Update auth token in app state
    if (authToken) {
      this.appState.set(CoreDefinition.APPSTATE_AUTH_TOKEN, authToken);

      return authToken;
    } else {
      // No auth token found in browser cookie, lets navigate to login page
      this.navigateToLoginPage();
    }
  }
}
