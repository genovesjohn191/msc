import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import {
  map,
  tap,
  shareReplay,
  startWith,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsApiService } from '@app/services';
import {
  McsInternetPort,
  RouteKey
} from '@app/models';
import { Search } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { InternetPortService } from './internet-port.service';
import { InternetListSource } from '../internet.listsource';

type tabGroupType = 'Management';

@Component({
  selector: 'mcs-internet-port',
  templateUrl: './internet-port.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetPortComponent extends McsRoutingTabBase<tabGroupType> implements OnInit, OnDestroy, AfterViewInit {
  public selectedInternetPort$: Observable<McsInternetPort>;
  public internetListing$: Observable<Map<string, McsInternetPort[]>>;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsInternetPort[]>>;
  public internetListSource: InternetListSource;

  @ViewChild('search')
  public search: Search;

  private _destroySubject = new Subject<void>();

  constructor(
    private _internetPortService: InternetPortService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    protected eventDispatcher: EventBusDispatcherService,
    protected activatedRoute: ActivatedRoute
  ) {
    super(eventDispatcher, activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public ngOnInit() {
    super.onInit();
    this._subscribeToInternetPortResolve();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    // Navigate route based on current active tab
    this._navigationService.navigateTo(RouteKey.InternetDetails, [this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    if (isNullOrEmpty(id)) { return; }
  }

  /**
   * Subcribes to internet port resolve
   */
  private _subscribeToInternetPortResolve(): void {
    this.selectedInternetPort$ = this.activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.internetPort)),
      tap((internetPort: McsInternetPort) => this._internetPortService.setSelectedInternetPort(internetPort)),
      shareReplay(1)
    );
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.internetListSource = new InternetListSource(
      this._apiService,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: McsInternetPort) => {
      let resourceName = isNullOrEmpty(item.availabilityZoneLabel) ? '' : item.availabilityZoneLabel;
      return resourceName;
    };

    // Listen to all records changed
    this.internetListing$ = this.internetListSource.findAllRecordsMapStream(keyFn).pipe(
      catchError((error) => {
        this.listStatusFactory.setError();
        return throwError(error);
      }),
      tap((response) => {
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      })
    );
    this._changeDetectorRef.markForCheck();
  }
}
