import {
  of,
  Observable
} from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2,
  McsTableEvents,
  SwitchAccountService
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  CompanyStatus,
  DataStatus,
  McsCompany,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  Paginator,
  Search
} from '@app/shared';
import {
  getEnumString,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

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
export class SwitchAccountComponent implements OnDestroy {

  @Output()
  public selectionChanged: EventEmitter<any>;

  public readonly dataSource: McsTableDataSource2<McsCompany>;
  public readonly dataEvents: McsTableEvents<McsCompany>;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _switchAccountService: SwitchAccountService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getCompanies.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeCompanies
    });
    this.selectionChanged = new EventEmitter();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  // Others
  public get companies(): McsCompany[] {
    return this._switchAccountService.companies;
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  // Icons
  public get chevronTopIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_UP;
  }

  public get arrowUpBueIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_BLUE;
  }

  public get arrowRightBueIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_RIGHT_BLUE;
  }

  public getUserIconKey(status: CompanyStatus) {
    let userIcon: string;
    switch (status) {
      case CompanyStatus.Internal:
      case CompanyStatus.Subsidiary:
      case CompanyStatus.Customer:
        userIcon = CommonDefinition.ASSETS_SVG_PERSON_GREEN;
        break;

      case CompanyStatus.Cancelling:
        userIcon = CommonDefinition.ASSETS_SVG_PERSON_RED;
        break;

      case CompanyStatus.Cancelled:
      case CompanyStatus.Prospect:
      case CompanyStatus.NoLonger:
      default:
        userIcon = CommonDefinition.ASSETS_SVG_PERSON_YELLOW;
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

  private _getCompanies(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsCompany>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    if (!this._switchAccountService.hasRequiredPermission()) { return of(null); }

    return this._apiService.getCompanies(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }
}
