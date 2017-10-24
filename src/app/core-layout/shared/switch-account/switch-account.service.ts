import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { CoreLayoutService } from '../../core-layout.services';
import {
  McsAuthenticationIdentity,
  McsApiCompany,
  CoreDefinition
} from '../../../core';
import { AppState } from '../../../app.service';
import { isNullOrEmpty } from '../../../utilities';

@Injectable()
export class SwitchAccountService {

  // Streams for data events
  public companiesStream: BehaviorSubject<McsApiCompany[]>;
  public recentCompaniesStream: BehaviorSubject<McsApiCompany[]>;
  public activeAccountStream: BehaviorSubject<McsApiCompany>;

  // Others
  private _activeAccount: McsApiCompany;

  constructor(
    private _coreLayoutService: CoreLayoutService,
    private _authIdentity: McsAuthenticationIdentity,
    private _appState: AppState
  ) {
    // Initialize member variables
    this.companiesStream = new BehaviorSubject(undefined);
    this.recentCompaniesStream = new BehaviorSubject(undefined);
    this.activeAccountStream = new BehaviorSubject(undefined);
    this._activeAccount = new McsApiCompany();

    // Initialize companies
    this._initializeCompanies();
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
    this._setAppstate();
    this.activeAccountStream.next(company);
  }

  /**
   * Initializes the companies data only once
   */
  private _initializeCompanies(): void {
    this._coreLayoutService.getCompanies()
      .subscribe((response) => {
        if (response) {
          this.companiesStream.next(response.content);
        }
      });
    this._appState.set(CoreDefinition.APPSTATE_DEFAULT_ACCOUNT, this.defaultAccount);
  }

  /**
   * Set app state and use it in api service
   */
  private _setAppstate(): void {
    if (this.defaultAccount.id !== this._activeAccount.id) {
      this._appState.set(CoreDefinition.APPSTATE_ACTIVE_ACCOUNT, this._activeAccount);
    } else {
      this._appState.set(CoreDefinition.APPSTATE_ACTIVE_ACCOUNT, undefined);
    }
  }
}
