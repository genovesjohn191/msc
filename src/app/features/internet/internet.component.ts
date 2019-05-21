import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsInternetPort
} from '@app/models';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-internet',
  templateUrl: './internet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetComponent
  extends McsTableListingBase<McsTableDataSource<McsInternetPort>>
  implements AfterViewInit, OnDestroy {

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => this.initializeDatasource());
  }

  public ngOnDestroy() {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the + icon key
   */
  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  /**
   * Creates a new order
   */
  public onClickNewOrder(): void {
    // Do the create order
  }

  /**
   * Navigate to order details page
   * @param order Order to view the details
   */
  public navigateToInternet(internet: McsInternetPort): void {
    if (isNullOrEmpty(internet)) { return; }
    // TODO: Add the navigation to internet port details here
  }

  /**
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_INTERNET_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new McsTableDataSource(this._getInternetPorts.bind(this));
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Gets the internet port listing based on the pagination and search
   * @param page Current page of the table
   * @param search Search keyword of the table
   */
  private _getInternetPorts(): Observable<McsInternetPort[]> {
    return this._apiService.getInternetPorts({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      keyword: this.search.keyword
    }).pipe(
      tap((apiCollection) => this.setTotalRecordsCount(apiCollection.totalCollectionCount)),
      map((apiCollection) => apiCollection.collection)
    );
  }
}
