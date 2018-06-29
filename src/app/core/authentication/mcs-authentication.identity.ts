import { Injectable } from '@angular/core';
import { McsApiCompany } from '../models/response/mcs-api-company';
import { McsApiIdentity } from '../models/response/mcs-api-identity';
import { AppState } from '../../app.service';
import { CoreDefinition } from '../core.definition';
import { BehaviorSubject } from 'rxjs';
import { McsAccountStatus } from '../enumerations/mcs-account-status.enum';
import { McsCookieService } from '../services/mcs-cookie.service';

@Injectable()
export class McsAuthenticationIdentity {

  /**
   * Event that triggers when the identity applied or changed
   */
  private _userChanged: BehaviorSubject<McsApiIdentity>;
  public get userChanged(): BehaviorSubject<McsApiIdentity> { return this._userChanged; }

  /**
   * Event that triggers when the active account was found or set
   */
  private _activeAccountChanged: BehaviorSubject<McsApiCompany>;
  public get activeAccountChanged(): BehaviorSubject<McsApiCompany> {
    return this._activeAccountChanged;
  }

  /**
   * Identity of the user logged in
   */
  private _user: McsApiIdentity;
  public get user(): McsApiIdentity { return this._user; }

  /**
   * Currently active account (switched account)
   */
  private _activeAccount: McsApiCompany;
  public get activeAccount(): McsApiCompany { return this._activeAccount; }

  /**
   * Returns the active account current status [default, impersonator]
   */
  public get activeAccountStatus(): McsAccountStatus {
    let hasActiveAccount = this._cookieService
      .getEncryptedItem<McsApiCompany>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    return hasActiveAccount ? McsAccountStatus.Impersonator : McsAccountStatus.Default;
  }

  constructor(
    private _appState: AppState,
    private _cookieService: McsCookieService
  ) {
    this._activeAccountChanged = new BehaviorSubject(undefined);
    this._userChanged = new BehaviorSubject(undefined);
    this._user = new McsApiIdentity();
    this._activeAccount = new McsApiCompany();
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
  public setActiveAccount(company: McsApiCompany): void {
    this._activeAccount = company;
    this._activeAccountChanged.next(company);
  }
}
