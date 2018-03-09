import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsApiCompany,
  McsCompanyStatus,
  McsPaginator,
  McsSearch,
  McsTextContentProvider,
  McsDataStatus
} from '../../../core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  isNullOrEmpty,
  getEnumString,
  unsubscribeSafely,
  deleteArrayRecord,
  getArrayCount
} from '../../../utilities';
import { SwitchAccountService } from './switch-account.service';
import { SwitchAccountRepository } from './switch-account.repository';

@Component({
  selector: 'mcs-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SwitchAccountComponent implements AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  @Output()
  public selectionChanged: EventEmitter<any>;

  // Companies
  public displayedCompanies: McsApiCompany[];
  public recentCompanies: McsApiCompany[];
  public activeAccount: McsApiCompany;

  // Subscriptions
  public companiesSubscription: Subscription;
  public recentCompaniesSubscription: Subscription;
  public activeAccountSubscription: Subscription;

  // Others
  public textContent: any;
  public get companies(): McsApiCompany[] {
    return this._switchAccountService.companies;
  }

  /**
   * Data status
   */
  private _dataStatus: McsDataStatus;
  public get dataStatus(): McsDataStatus { return this._dataStatus; }
  public set dataStatus(value: McsDataStatus) {
    if (value !== this._dataStatus) {
      this._dataStatus = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._switchAccountRepository) ? 0 :
      this._switchAccountRepository.totalRecordsCount;
  }

  public get filteredRecordCount(): number {
    return getArrayCount(this.displayedCompanies);
  }

  // Icons
  public get chevronTopIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_UP;
  }

  public get arrowUpBueIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_BLUE;
  }

  public get arrowRightBueIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_RIGHT_BLUE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  constructor(
    private _switchAccountService: SwitchAccountService,
    private _switchAccountRepository: SwitchAccountRepository,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.selectionChanged = new EventEmitter();
    this.textContent = this._textContentProvider.content.switchAccount;
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this._listenToCompanies();
      this._listenToRecentCompanies();
      this._listenToActiveCompany();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.companiesSubscription);
    unsubscribeSafely(this.recentCompaniesSubscription);
    unsubscribeSafely(this.activeAccountSubscription);
  }

  public getUserIconKey(status: McsCompanyStatus) {
    let userIcon: string;
    switch (status) {
      case McsCompanyStatus.Internal:
      case McsCompanyStatus.Subsidiary:
      case McsCompanyStatus.Customer:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_GREEN;
        break;

      case McsCompanyStatus.Cancelling:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_RED;
        break;

      case McsCompanyStatus.Cancelled:
      case McsCompanyStatus.Prospect:
      case McsCompanyStatus.NoLonger:
      default:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_YELLOW;
        break;
    }
    return userIcon;
  }

  public getStatusText(status: McsCompanyStatus) {
    return getEnumString(McsCompanyStatus, status);
  }

  public get defaultAccount(): McsApiCompany {
    return this._switchAccountService.defaultAccount;
  }

  public getTextFormat(company: McsApiCompany): string {
    if (isNullOrEmpty(company)) { return ''; }
    return `${company.name} (${company.id})`;
  }

  /**
   * Track by function to help determine the view which data has beed modified
   * @param index Index of the current loop
   * @param _item Item of the loop
   */
  public trackByFn(index: any, _item: any) {
    return index;
  }

  /**
   * Select the corresponding account and refresh the page
   */
  public selectAccount(account: McsApiCompany): void {
    if (isNullOrEmpty(account)) { return; }
    this._switchAccountService.switchAccount(account);
    this.selectionChanged.emit(account);
  }

  /**
   * Retry getting the companies
   */
  public retry(): void {
    unsubscribeSafely(this.companiesSubscription);
    this._listenToCompanies();
  }

  /**
   * Company list observables that is currently listening
   * to any changes of the page/search
   */
  private _listenToCompanies(): void {
    const displayDataChanges = [
      Observable.of(undefined),
      this.paginator.pageChangedStream,
      this.search.searchChangedStream
    ];

    this.companiesSubscription = Observable.merge(...displayDataChanges)
      .switchMap((instance) => {
        // Notify the component that a process is currently in-progress
        // if the user is not searching because the filtering has already a loader
        // and we need to check it here since the component can be recreated during runtime
        let isSearching = !isNullOrEmpty(instance) && instance.searching;
        if (!isSearching) {
          this.dataStatus = McsDataStatus.InProgress;
        }

        // Find all records based on settings provided in the input
        return this._switchAccountRepository.findAllRecords(this.paginator, this.search);
      })
      .catch((error) => {
        this.dataStatus = McsDataStatus.Error;
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.displayedCompanies = response.slice();

        this._removeActiveDefaultAccounts();
        this.search.showLoading(false);
        this.paginator.showLoading(false);
        this.dataStatus = isNullOrEmpty(this.displayedCompanies) ?
          McsDataStatus.Empty : McsDataStatus.Success;
      });
  }

  /**
   * Listener to recent companies selected
   */
  private _listenToRecentCompanies(): void {
    this.recentCompaniesSubscription = this._switchAccountService.recentCompaniesStream
      .subscribe((recent) => {
        this.recentCompanies = recent;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener to active company changes
   */
  private _listenToActiveCompany(): void {
    this.activeAccountSubscription = this._switchAccountService.activeAccountStream
      .subscribe(() => {
        this._removeActiveDefaultAccounts();
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Remove the active account and default account from displayed records
   */
  private _removeActiveDefaultAccounts(): void {
    deleteArrayRecord(this.displayedCompanies, (_item) => {
      let isActive = this._switchAccountService.activeAccount.id === _item.id;
      let isDefault = this.defaultAccount.id === _item.id;

      // Se tthe actual count based on deduction from active and default account
      this._switchAccountRepository.totalRecordsCount -= isActive || isDefault ? 1 : 0;
      return isActive || isDefault;
    });
  }
}
