import { Injectable } from '@angular/core';
import {
  McsCompany,
  McsIdentity,
  AccountStatus,
  McsPlatform
} from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { CommonDefinition } from '@app/utilities';
import { McsCookieService } from '../services/mcs-cookie.service';

@Injectable()
export class McsAuthenticationIdentity {
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
   * Platform settings based on target account
   */
  private _platformSettings: McsPlatform;
  public get platformSettings(): McsPlatform { return this._platformSettings; }

  /**
   * Returns the active account current status [default, impersonator]
   */
  public get activeAccountStatus(): AccountStatus {
    let hasActiveAccount = this._cookieService
      .getEncryptedItem<McsCompany>(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
    return hasActiveAccount ? AccountStatus.Impersonator : AccountStatus.Default;
  }

  constructor(
    private _cookieService: McsCookieService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._user = new McsIdentity();
    this._platformSettings = new McsPlatform();
    this._activeAccount = new McsCompany();
  }

  /**
   * Sets the currently active user
   * @param identity The user identity to be set
   */
  public setActiveUser(identity: McsIdentity): void {
    this._user = identity;
    this._eventDispatcher.dispatch(McsEvent.userChange, identity);
  }

  /**
   * Sets the active acount on the identity
   * @param company The company to be active
   */
  public setActiveAccount(company: McsCompany): void {
    this._activeAccount = company;
    this._eventDispatcher.dispatch(McsEvent.accountChange, this._activeAccount);
  }

  /**
   * Sets the currently active platform settings
   * @param platform The account platform to be set
   */
  public setActivePlatform(platform: McsPlatform): void {
    this._platformSettings = platform;
  }
}
