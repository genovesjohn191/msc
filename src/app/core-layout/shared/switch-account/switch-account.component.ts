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
  unsubscribeSafely
} from '../../../utilities';
import { SwitchAccountService } from './switch-account.service';

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
  public get dataStatus(): McsDataStatus {
    return this._switchAccountService.companiesStatus;
  }
  public get dataStatusEnum(): any {
    return McsDataStatus;
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
        // TODO: This should be color yellow icon
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_BLUE;
        break;

      case McsCompanyStatus.Cancelled:
      case McsCompanyStatus.Prospect:
      case McsCompanyStatus.NoLonger:
      default:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_RED;
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
    return `${company.name}(${company.id})`;
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
    this._switchAccountService.getCompanies();
  }

  /**
   * Company list observables that is currently listening
   * to any changes of the page/search
   */
  private _listenToCompanies(): void {
    const displayDataChanges = [
      this._switchAccountService.companiesStream,
      this.paginator.pageChangedStream,
      this.search.searchChangedStream
    ];

    this.companiesSubscription = Observable.merge(...displayDataChanges)
      .map(() => {
        // Get all record by page settings
        let pageData = this.companies.slice();
        let displayedCount = (this.paginator.pageIndex + 1) * this.paginator.pageSize;

        // Get all record by filter settings and return them
        let actualData = pageData.slice(0, displayedCount);
        return actualData.slice().filter((item: McsApiCompany) => {
          let searchStr = (item.name + item.id).toLowerCase();
          return searchStr.indexOf(this.search.keyword.toLowerCase()) !== -1;
        });
      })
      .subscribe((result) => {
        if (this._switchAccountService.companiesStatus !== McsDataStatus.Error) {
          this._switchAccountService.companiesStatus = isNullOrEmpty(result) ?
            McsDataStatus.Empty : McsDataStatus.Success;
        }
        this.displayedCompanies = result;
        this.search.showLoading(false);
        this.paginator.showLoading(false);
        this._changeDetectorRef.markForCheck();
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
      .subscribe((active) => {
        this.activeAccount = active;
        this._changeDetectorRef.markForCheck();
      });
  }
}
