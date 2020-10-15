import {
  BehaviorSubject,
  Observable,
  Subscription
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  InjectionToken,
  Injector,
  ViewChild
} from '@angular/core';
import {
  McsApiCollection,
  McsQueryParam
} from '@app/models';
import {
  ListPanelConfig,
  Search
} from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  McsDisposable
} from '@app/utilities';
import {
  EventBusDispatcherService,
  EventBusState
} from '@peerlancers/ngx-event-bus';

import { McsListViewDatasource } from '../data-access/mcs-listview-datasource';

export interface ListViewListingConfig {
  dataChangeEvent?: EventBusState<any>;
  dataAddEvent?: EventBusState<any>;
  dataDeleteEvent?: EventBusState<any>;
  panelSettings?: ListPanelConfig;
}
export const LISTVIEWCONFIG_INJECTION = new InjectionToken<ListViewListingConfig>('ListViewListingConfig');

@Component({ template: ''})
export abstract class McsListViewListingBase<TEntity> implements AfterViewInit, McsDisposable {

  public listViewDatasource = new McsListViewDatasource<TEntity>();

  protected readonly eventDispatcher: EventBusDispatcherService;

  private _dataRecordsChange = new BehaviorSubject<TEntity[]>(null);
  private _dataChangeHandler: Subscription;
  private _totalRecordsCount: number = 0;
  private _search: Search;

  constructor(
    protected injector: Injector,
    protected changeDetectorRef: ChangeDetectorRef,
    @Inject(LISTVIEWCONFIG_INJECTION) public listViewConfig: ListViewListingConfig = {}
  ) {
    this.eventDispatcher = injector.get(EventBusDispatcherService);
    this._registerDataEvents();
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this._initializeDatasource();
    });
  }

  @ViewChild('search', { static: false })
  public set search(value: Search) {
    if (this._search !== value) {
      this._search = value;
      this.listViewDatasource.registerSearch(value);
    }
  }

  /**
   * Disposes all the resources of the listview
   */
  public dispose(): void {
    unsubscribeSafely(this._dataChangeHandler);
    unsubscribeSafely(this._dataRecordsChange);
    this.listViewDatasource.disconnect();
  }

  /**
   * Returns the total records count of the record
   */
  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  /**
   * Event that emits when the record has been changed
   */
  public dataRecordsChange(): Observable<TEntity[]> {
    return this._dataRecordsChange.asObservable();
  }

  protected abstract getEntityListing(query?: McsQueryParam): Observable<McsApiCollection<TEntity>>;

  /**
   * Sets the total records count
   * @param count Count to be set
   */
  private _setTotalRecordsCount(count: number): void {
    this._totalRecordsCount = count;
  }

  /**
   * Get entity collection content
   */
  private _getEntityCollection(): Observable<TEntity[]> {
    return this.getEntityListing({
      pageIndex: CommonDefinition.PAGE_INDEX_DEFAULT,
      pageSize: CommonDefinition.PAGE_SIZE_MAX,
      keyword: getSafeProperty(this._search, (obj) => obj.keyword, '')
    }).pipe(
      tap((apiCollection) => this._setTotalRecordsCount(apiCollection.totalCollectionCount)),
      map((entityCollection) => entityCollection.collection),
      tap(() => this.changeDetectorRef.markForCheck())
    );
  }

  /**
   * Registers data change event handlers
   */
  private _registerDataEvents(): void {
    if (!isNullOrEmpty(this.listViewConfig.dataChangeEvent)) {
      this._dataChangeHandler = this.eventDispatcher.addEventListener(
        this.listViewConfig.dataChangeEvent, this._onDataChanged.bind(this)
      );
    }

    if (!isNullOrEmpty(this.listViewConfig.dataAddEvent)) {
      this._dataChangeHandler = this.eventDispatcher.addEventListener(
        this.listViewConfig.dataAddEvent, this._initializeDatasource.bind(this)
      );
    }

    if (!isNullOrEmpty(this.listViewConfig.dataDeleteEvent)) {
      this._dataChangeHandler = this.eventDispatcher.addEventListener(
        this.listViewConfig.dataDeleteEvent, this._initializeDatasource.bind(this)
      );
    }
  }

  /**
   * Initializes the data source
   */
  private _initializeDatasource(): void {
    this.listViewDatasource.updateDatasource(this._getEntityCollection.bind(this));
  }

  /**
   * Event that emits when data has been changed
   */
  private _onDataChanged(): void {
    this.changeDetectorRef.markForCheck();
  }
}
