import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  McsCompany,
  McsIdentity,
  McsAccountStatus
} from '@app/models';
import { AppState } from '@app/app.service';
import { CoreDefinition } from '../core.definition';
import { McsCookieService } from '../services/mcs-cookie.service';

@Injectable()
export class McsAuthenticationIdentity {

  /**
   * Event that triggers when the identity applied or changed
   */
  private _userChanged: BehaviorSubject<McsIdentity>;
  public get userChanged(): BehaviorSubject<McsIdentity> { return this._userChanged; }

  /**
   * Event that triggers when the active account was found or set
   */
  private _activeAccountChanged: BehaviorSubject<McsCompany>;
  public get activeAccountChanged(): BehaviorSubject<McsCompany> {
    return this._activeAccountChanged;
  }

  /**
   * Identity of the user logged in
   */
  private _user: McsIdentity;
  public get user(): McsIdentity { return this._user; }

  /**
   * Currently active account (switched account)
   */
  private _activeAccount: McsCompany;
  public get activeAccount(): McsCompany { return this._activeAccount; }

  /**
   * Returns the active account current status [default, impersonator]
   */
  public get activeAccountStatus(): McsAccountStatus {
    let hasActiveAccount = this._cookieService
      .getEncryptedItem<McsCompany>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    return hasActiveAccount ? McsAccountStatus.Impersonator : McsAccountStatus.Default;
  }

  constructor(
    private _appState: AppState,
    private _cookieService: McsCookieService
  ) {
    this._activeAccountChanged = new BehaviorSubject(undefined);
    this._userChanged = new BehaviorSubject(undefined);
    this._user = new McsIdentity();
    this._activeAccount = new McsCompany();
  }

  /**
   * Apply the given identity to the service
   */
  public applyIdentity(): void {
    let identity = this._appState.get(CoreDefinition.APPSTATE_AUTH_IDENTITY);
    if (!identity) { return; }
    this._user = identity;
    this._userChanged.next(this._user);
  }

  /**
   * Sets the active acount on the identity
   * @param company The company to be active
   */
  public setActiveAccount(company: McsCompany): void {
    this._activeAccount = company;
    this._activeAccountChanged.next(company);
  }
}
