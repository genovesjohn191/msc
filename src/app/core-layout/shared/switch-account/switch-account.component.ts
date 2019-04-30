import {
  Component,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  CoreDefinition,
  McsTableListingBase,
  McsTableDataSource,
  McsBrowserService
} from '@app/core';
import {
  isNullOrEmpty,
  getEnumString,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsCompany,
  CompanyStatus,
  DataStatus
} from '@app/models';
import { McsCompaniesRepository } from '@app/services';
import { SwitchAccountService } from './switch-account.service';

@Component({
  selector: 'mcs-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'switch-account-wrapper'
  }
})

export class SwitchAccountComponent
  extends McsTableListingBase<McsTableDataSource<McsCompany>>
  implements AfterViewInit, OnDestroy {

  @Output()
  public selectionChanged: EventEmitter<any>;

  // Others
  public get companies(): McsCompany[] {
    return this._switchAccountService.companies;
  }

  private _destroySubject = new Subject<void>();

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  public get filteredRecordCount(): number {
    return this.dataSource && this.dataSource.dataRecords.length;
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

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _switchAccountService: SwitchAccountService,
    private _companiesRepository: McsCompaniesRepository
  ) {
    super(_browserService, _changeDetectorRef);
    this.selectionChanged = new EventEmitter();
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getUserIconKey(status: CompanyStatus) {
    let userIcon: string;
    switch (status) {
      case CompanyStatus.Internal:
      case CompanyStatus.Subsidiary:
      case CompanyStatus.Customer:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_GREEN;
        break;

      case CompanyStatus.Cancelling:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_RED;
        break;

      case CompanyStatus.Cancelled:
      case CompanyStatus.Prospect:
      case CompanyStatus.NoLonger:
      default:
        userIcon = CoreDefinition.ASSETS_SVG_PERSON_YELLOW;
        break;
    }
    return userIcon;
  }

  public getStatusText(status: CompanyStatus) {
    return getEnumString(CompanyStatus, status);
  }

  public get defaultAccount(): McsCompany {
    return this._switchAccountService.defaultAccount;
  }

  public getTextFormat(company: McsCompany): string {
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
  public selectAccount(account: McsCompany): void {
    if (isNullOrEmpty(account)) { return; }
    this._switchAccountService.switchAccount(account);
    this.selectionChanged.emit(account);
  }

  /**
   * Retry getting the companies
   */
  public retry(): void {
    this.initializeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    if (!this._switchAccountService.hasRequiredPermission()) { return; }

    this.dataSource = new McsTableDataSource(this._companiesRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return null;
  }
}
