import {
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  convertMapToJsonObject,
  unsubscribeSubject
} from '@app/utilities';
import {
  McsFilterInfo,
  Breakpoint
} from '@app/models';
import {
  Search,
  Paginator,
  FilterSelector
} from '@app/shared';
import { McsBrowserService } from '../services/mcs-browser.service';

export abstract class McsTableListingBase<T> {
  @ViewChild('search')
  public search: Search;

  @ViewChild('paginator')
  public paginator: Paginator;

  @ViewChild('filterSelector')
  public filterSelector: FilterSelector;

  // Table variables
  public dataSource: T;
  public dataColumns: string[] = [];
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
    this._subscribeToBreakpointChange();
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
    this.dataColumns = Object.keys(this.columnSettings);
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
  private _subscribeToBreakpointChange(): void {
    this.browserService.breakpointChange()
      .pipe(takeUntil(this._baseDestroySubject))
      .subscribe((deviceType) => {
        this.isMobile = deviceType === Breakpoint.Small ||
          deviceType === Breakpoint.XSmall;
      });
  }
}
