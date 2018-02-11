import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { CoreLayoutService } from '../../core-layout.services';
import {
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsApiCompany,
  CoreDefinition,
  McsDataStatus,
  McsCookieService,
  McsApiSuccessResponse
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SwitchAccountService {

  // Streams for data events
  public recentCompaniesStream: BehaviorSubject<McsApiCompany[]>;
  public activeAccountStream: BehaviorSubject<McsApiCompany>;

  // Company List
  public companies: McsApiCompany[];
  public loadingAccount: boolean = true;
  public companiesStatus: McsDataStatus;

  // Others
  private _activeAccount: McsApiCompany;
  private _hasPermission: boolean;

  constructor(
    private _coreLayoutService: CoreLayoutService,
    private _authIdentity: McsAuthenticationIdentity,
    private _authService: McsAuthenticationService,
    private _cookieService: McsCookieService
  ) {
    // Initialize member variables
    this.companies = new Array();
    this.recentCompaniesStream = new BehaviorSubject(undefined);
    this.activeAccountStream = new BehaviorSubject(undefined);

    // Initialize companies
    if (this._authService.hasPermission(['CompanyView'])) {
      this._hasPermission = true;
    }
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
   * Active account
   */
  public get activeAccount(): McsApiCompany {
    return isNullOrEmpty(this._activeAccount) ? this.defaultAccount : this._activeAccount;
  }

  /**
   * Select the company to be switched and notify the stream
   */
  public switchAccount(company: McsApiCompany) {
    if (isNullOrEmpty(company)) { return; }
    this._activeAccount = company;
    this._saveAccountIdToCookie();
    this.activeAccountStream.next(company);

    // Refresh the page
    location.reload();
  }

  /**
   * Get all the companies from the API
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  public getCompanies(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }) {
    let emptyResponse = new McsApiSuccessResponse<McsApiCompany[]>();
    emptyResponse.content = [];
    return !this._hasPermission ? Observable.of(emptyResponse) :
      this._coreLayoutService.getCompanies(args);
  }

  /**
   * Get the active account from cookie
   */
  public setActiveAccount(_content: McsApiCompany[]): void {
    let selectedAccountId = this._cookieService
      .getEncryptedItem<McsApiCompany>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    if (!isNullOrEmpty(selectedAccountId)) {
      let accountFound = _content.find((company) => {
        return company.id === selectedAccountId;
      });
      if (!isNullOrEmpty(accountFound)) {
        this._activeAccount = accountFound;
      }
    }
    this.loadingAccount = false;
    this.activeAccountStream.next(this._activeAccount);
  }

  /**
   * Set Active account to cookie and App state
   */
  private _saveAccountIdToCookie(): void {
    if (this.defaultAccount.id !== this._activeAccount.id) {
      this._cookieService.setEncryptedItem(
        CoreDefinition.COOKIE_ACTIVE_ACCOUNT,
        this._activeAccount.id,
        { expires: this._authIdentity.expiry }
      );
    } else {
      this._cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    }
  }
}
