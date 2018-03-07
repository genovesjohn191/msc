import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  McsAuthenticationIdentity,
  McsApiCompany,
  CoreDefinition,
  McsDataStatus,
  McsCookieService,
  McsAuthenticationService
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';
import { SwitchAccountRepository } from './switch-account.repository';

@Injectable()
export class SwitchAccountService {

  // Streams for data events
  public recentCompaniesStream: BehaviorSubject<McsApiCompany[]>;
  public activeAccountStream: BehaviorSubject<McsApiCompany>;

  // Company List
  public companies: McsApiCompany[];
  public loadingAccount: boolean = false;
  public companiesStatus: McsDataStatus;

  // Others
  private _activeAccount: McsApiCompany;
  private _hasPermission: boolean;

  constructor(
    private _authIdentity: McsAuthenticationIdentity,
    private _authService: McsAuthenticationService,
    private _cookieService: McsCookieService,
    private _accountRepository: SwitchAccountRepository
  ) {
    // Initialize member variables
    this.companies = new Array();
    this.recentCompaniesStream = new BehaviorSubject(undefined);
    this.activeAccountStream = new BehaviorSubject(undefined);

    if (this._authService.hasPermission(['CompanyView'])) {
      this._hasPermission = true;
    }

    // Initialize companies
    refreshView(() => {
      this.setActiveAccount();
    });
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

    // Navigate to home page and refresh.
    location.href = '';
  }

  /**
   * Get the active account from cookie
   */
  public setActiveAccount(): void {
    let selectedAccountId = this._cookieService
      .getEncryptedItem<string>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);

    // Set default account function pointer
    let setDefaultAccount: () => void = () => {
      this.loadingAccount = false;
      this._activeAccount = this.defaultAccount;
      this.activeAccountStream.next(this._activeAccount);
    };

    let hasSelectedAccount = !isNullOrEmpty(selectedAccountId) && this._hasPermission;
    if (hasSelectedAccount) {
      // Get the active account based on cookie when user has admin access
      this.loadingAccount = true;
      this._accountRepository
        .findRecordById(selectedAccountId)
        .catch((error) => {
          setDefaultAccount();
          return Observable.throw(error);
        })
        .subscribe((account) => {
          this.loadingAccount = false;
          this._activeAccount = account;
          this.activeAccountStream.next(this._activeAccount);
        });
    } else {
      // Set the default account in case the user doesnt have admin access
      setDefaultAccount();
    }
  }

  /**
   * Set Active account to cookie and App state
   */
  private _saveAccountIdToCookie(): void {
    if (this.defaultAccount.id !== this._activeAccount.id) {
      this._cookieService.setEncryptedItem<string>(
        CoreDefinition.COOKIE_ACTIVE_ACCOUNT,
        this._activeAccount.id,
        { expires: this._authIdentity.expiry }
      );
    } else {
      this._cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    }
  }
}
