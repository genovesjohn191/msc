import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import { CookieService } from 'ngx-cookie';
import { CoreLayoutService } from '../../core-layout.services';
import {
  McsAuthenticationIdentity,
  McsApiCompany,
  CoreDefinition,
  McsDataStatus
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';

@Injectable()
export class SwitchAccountService {

  // Streams for data events
  public companiesStream: BehaviorSubject<McsApiCompany[]>;
  public recentCompaniesStream: BehaviorSubject<McsApiCompany[]>;
  public activeAccountStream: BehaviorSubject<McsApiCompany>;

  // Company List
  public companies: McsApiCompany[];
  public obtainedSuccessfully: boolean;
  public companiesStatus: McsDataStatus;

  // Others
  private _activeAccount: McsApiCompany;

  constructor(
    private _coreLayoutService: CoreLayoutService,
    private _authIdentity: McsAuthenticationIdentity,
    private _cookieService: CookieService
  ) {
    // Initialize member variables
    this.companies = new Array();
    this.companiesStream = new BehaviorSubject(undefined);
    this.recentCompaniesStream = new BehaviorSubject(undefined);
    this.activeAccountStream = new BehaviorSubject(undefined);
    this._activeAccount = new McsApiCompany();

    // Initialize companies
    this.getCompanies();
    this._getActiveAccount();
  }

  /**
   * Default company setting
   */
  public get defaultAccount(): McsApiCompany {
    return {
      id: this._authIdentity.companyId,
      name: this._authIdentity.companyName
    } as McsApiCompany;
  }

  /**
   * Select the company to be switched and notify the stream
   */
  public switchAccount(company: McsApiCompany) {
    if (isNullOrEmpty(company)) { return; }
    this._activeAccount = company;
    this._setActiveAccount();
    this.activeAccountStream.next(company);
  }

  /**
   * Initializes the companies data only once
   */
  public getCompanies(): void {
    this.companiesStatus = McsDataStatus.InProgress;

    this._coreLayoutService.getCompanies()
      .catch((error) => {
        this.companiesStatus = McsDataStatus.Error;
        this.companiesStream.next(undefined);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (response) {
          this.companiesStatus = response.content ?
            McsDataStatus.Empty : McsDataStatus.Success;
          this.companies = response.content;
          this.companiesStream.next(response.content);
        }
      });
  }

  /**
   * Get the active account from cookie
   */
  private _getActiveAccount(): void {
    let selectedAccount = this._cookieService.get(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    if (selectedAccount) {
      this._activeAccount = JSON.parse(selectedAccount);
      this.activeAccountStream.next(this._activeAccount);
    }
  }

  /**
   * Set Active account to cookie and App state
   */
  private _setActiveAccount(): void {
    if (this.defaultAccount.id !== this._activeAccount.id) {
      this._cookieService.put(
        CoreDefinition.COOKIE_ACTIVE_ACCOUNT,
        JSON.stringify(this._activeAccount),
        { expires: this._authIdentity.expiry }
      );
    } else {
      this._cookieService.remove(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    }
  }
}
