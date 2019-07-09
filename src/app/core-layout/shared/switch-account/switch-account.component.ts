import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Injector
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  CoreDefinition,
  McsTableListingBase
} from '@app/core';
import {
  isNullOrEmpty,
  getEnumString
} from '@app/utilities';
import {
  McsCompany,
  CompanyStatus,
  DataStatus,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { SwitchAccountService } from './switch-account.service';
import { McsEvent } from '@app/event-manager';

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

export class SwitchAccountComponent extends McsTableListingBase<McsCompany> {

  @Output()
  public selectionChanged: EventEmitter<any>;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _switchAccountService: SwitchAccountService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeCompanies });
    this.selectionChanged = new EventEmitter();
  }

  // Others
  public get companies(): McsCompany[] {
    return this._switchAccountService.companies;
  }

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
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return null;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsCompany>> {
    if (!this._switchAccountService.hasRequiredPermission()) { return of(null); }
    return this._apiService.getCompanies(query);
  }
}
