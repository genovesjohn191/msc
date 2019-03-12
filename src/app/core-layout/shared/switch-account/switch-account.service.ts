import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  throwError,
  Observable
} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  McsAuthenticationIdentity,
  CoreDefinition,
  McsCookieService,
  McsAccessControlService
} from '@app/core';
import {
  McsCompany,
  DataStatus,
  McsPermission
} from '@app/models';
import {
  isNullOrEmpty,
  refreshView
} from '@app/utilities';
import { McsCompaniesRepository } from '@app/services';

@Injectable()
export class SwitchAccountService {

  // Streams for data events
  public recentCompaniesStream: BehaviorSubject<McsCompany[]>;
  public activeAccountStream: BehaviorSubject<McsCompany>;

  // Company List
  public companies: McsCompany[];
  public loadingAccount: boolean = false;
  public companiesStatus: DataStatus;

  // Others
  private _activeAccount: McsCompany;

  constructor(
    private _authIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService,
    private _cookieService: McsCookieService,
    private _companiesRepository: McsCompaniesRepository
  ) {
    // Initialize member variables
    this.companies = new Array();
    this.recentCompaniesStream = new BehaviorSubject(undefined);
    this.activeAccountStream = new BehaviorSubject(undefined);

    // Initialize companies
    refreshView(() => {
      this.setActiveAccount();
    });
  }

  /**
   * Default company setting
   */
  public get defaultAccount(): McsCompany {
    return {
      id: this._authIdentity.user.companyId,
      name: this._authIdentity.user.companyName
    } as McsCompany;
  }

  /**
   * Active account
   */
  public get activeAccount(): McsCompany {
    return isNullOrEmpty(this._activeAccount) ? this.defaultAccount : this._activeAccount;
  }

  /**
   * Select the company to be switched and notify the stream
   */
  public switchAccount(company: McsCompany) {
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

    let hasSelectedAccount = !isNullOrEmpty(selectedAccountId) && this.hasRequiredPermission();
    if (hasSelectedAccount) {
      // Get the active account based on cookie when user has admin access
      this.loadingAccount = true;
      this.activeAccountStream.next(this._activeAccount);

      this._getAccountById(selectedAccountId).pipe(
        catchError((error) => {
          setDefaultAccount();
          return throwError(error);
        })
      ).subscribe();
    } else {
      // Set the default account in case the user doesnt have admin access
      setDefaultAccount();
      this._authIdentity.setActiveAccount(this.defaultAccount);
    }
  }

  /**
   * Returns true if the user has company view permission
   */
  public hasRequiredPermission(): boolean {
    return this._accessControlService.hasPermission([McsPermission.CompanyView]);
  }

  /**
   * Get account by account ID
   * @param accountId Account id to obtain from API
   */
  private _getAccountById(accountId: string): Observable<McsCompany> {
    return this._companiesRepository.getById(accountId).pipe(
      tap((account) => {
        this.loadingAccount = false;
        this._activeAccount = account;
        this._authIdentity.setActiveAccount(this._activeAccount);
        this.activeAccountStream.next(this._activeAccount);
      })
    );
  }

  /**
   * Set Active account to cookie and App state
   */
  private _saveAccountIdToCookie(): void {
    if (this.defaultAccount.id !== this._activeAccount.id) {
      this._cookieService.setEncryptedItem<string>(
        CoreDefinition.COOKIE_ACTIVE_ACCOUNT,
        this._activeAccount.id,
        { expires: this._authIdentity.user.expiry }
      );
    } else {
      this._cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    }
  }
}
