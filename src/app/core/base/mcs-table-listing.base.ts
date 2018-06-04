import {
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  McsBrowserService,
  McsDeviceType
} from '../services/mcs-browser.service';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';
import { McsSearch } from '../interfaces/mcs-search.interface';
import { McsPaginator } from '../interfaces/mcs-paginator.interface';

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
  public columnSettings: any;

  /**
   * Determine weather the browser/platform is in mobile
   */
  private _isMobile: boolean;
  public get isMobile(): boolean {
    return this._isMobile;
  }
  public set isMobile(value: boolean) {
    if (this._isMobile !== value) {
      this._isMobile = value;
      this.changeDetectorRef.markForCheck();
    }
  }

  constructor(
    protected browserService: McsBrowserService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    this.dataColumns = new Array();
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
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
    }
  }

  /**
   * This will initialize the datasource from the derived class
   *
   * `@Note` This should be called inside AfterViewInit to make sure the
   * element was completely rendered in the DOM
   */
  protected abstract initializeDatasource(): void;

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
    unsubscribeSafely(this.browserServiceSubscription);
  }

  /**
   * Listen to any changes in size of the browser
   */
  private _listenToBroswerDeviceType(): void {
    this.browserServiceSubscription = this.browserService.deviceTypeStream
      .subscribe((deviceType) => {
        this.isMobile = deviceType === McsDeviceType.MobileLandscape ||
          deviceType === McsDeviceType.MobilePortrait;
      });
  }
}
