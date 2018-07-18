import {
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsBrowserService,
  McsDeviceType
} from '../services/mcs-browser.service';
import {
  isNullOrEmpty,
  convertMapToJsonObject,
  unsubscribeSubject
} from '../../utilities';
import { McsSearch } from '../interfaces/mcs-search.interface';
import { McsPaginator } from '../interfaces/mcs-paginator.interface';
import { McsFilterInfo } from '../models/mcs-filter-info';

export abstract class McsTableListingBase<T> {

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  // Subscription
  public browserServiceSubscription: any;

  // Table variables
  public dataSource: T;
  public dataColumns: string[];
  public hiddenColumnsKey: string[];

  /**
   * Returns the column settings in json format in order to use it over html easily
   * `e.g:` columnSettings.name.text
   */
  public columnSettings: any;

  /**
   * Determine weather the browser/platform is in mobile
   */
  private _isMobile: boolean;
  public get isMobile(): boolean { return this._isMobile; }
  public set isMobile(value: boolean) {
    if (this._isMobile !== value) {
      this._isMobile = value;
      this.changeDetectorRef.markForCheck();
    }
  }

  private _baseDestroySubject = new Subject<void>();

  constructor(
    protected browserService: McsBrowserService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this.dataColumns = new Array();
    this.hiddenColumnsKey = new Array();
    this._listenToBroswerDeviceType();
  }

  /**
   * Returns true when search box is currently processing
   */
  public get isSearching(): boolean {
    return isNullOrEmpty(this.search) ? false :
      this.search.keyword.length > 0;
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: Map<string, McsFilterInfo>): void {
    if (isNullOrEmpty(columns)) { return; }
    this.columnSettings = convertMapToJsonObject(columns);

    // Populate the data columns once so that it won't render multiple times in dom
    let dataColumnChanged = isNullOrEmpty(this.dataColumns) ||
      this.dataColumns.length !== columns.size;
    if (dataColumnChanged) {
      this.dataColumns = [];
      columns.forEach((_value, _key) => this.dataColumns.push(_key));
    }

    // Set the displayed columns key based on the toggled
    this.hiddenColumnsKey = [];
    columns.forEach((_filterInfo, _key) => {
      if (_filterInfo.value) { return; }
      this.hiddenColumnsKey.push(_key);
    });
  }

  /**
   * Returns true when the column is hidden
   */
  public isColumnHidden(columnName: string): boolean {
    let noFilteredColumns = isNullOrEmpty(columnName) || isNullOrEmpty(this.hiddenColumnsKey);
    if (noFilteredColumns) { return false; }
    return !!this.hiddenColumnsKey.find((hiddenColumn) => hiddenColumn === columnName);
  }

  /**
   * This will initialize the datasource from the derived class
   *
   * `@Note` This should be called inside AfterViewInit to make sure the
   * element was completely rendered in the DOM
   */
  protected abstract initializeDatasource(): void;

  /**
   * Returns the column settings filter key or the listing table
   */
  protected abstract get columnSettingsKey(): string;

  /**
   * Returns the total records count of the listing table
   */
  protected abstract get totalRecordsCount(): number;

  /**
   * Retry the obtainment from the datasource when an error occured
   *
   * `@Note` Call this method when there is an error occured only
   */
  protected retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this.initializeDatasource();
  }

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    if (!isNullOrEmpty(this.dataSource)) {
      (this.dataSource as any).disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
    unsubscribeSubject(this._baseDestroySubject);
  }

  /**
   * Listen to any changes in size of the browser
   */
  private _listenToBroswerDeviceType(): void {
    this.browserService.deviceTypeStream
      .pipe(takeUntil(this._baseDestroySubject))
      .subscribe((deviceType) => {
        this.isMobile = deviceType === McsDeviceType.MobileLandscape ||
          deviceType === McsDeviceType.MobilePortrait;
      });
  }
}
