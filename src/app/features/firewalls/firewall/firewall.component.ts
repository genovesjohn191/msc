import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Subject,
  throwError,
  Observable
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import {
  McsRoutingTabBase,
  McsDataStatusFactory,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  RouteKey,
  McsFirewall
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { FirewallService } from './firewall.service';
import { FirewallsListSource } from '../firewalls.listsource';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'policies';

@Component({
  selector: 'mcs-firewall',
  templateUrl: './firewall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class FirewallComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  public selectedFirewall$: Observable<McsFirewall>;
  public firewallListing$: Observable<Map<string, McsFirewall[]>>;
  public firewallsListSource: FirewallsListSource | null;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsFirewall[]>>;

  @ViewChild('search')
  public search: Search;

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    _activatedRoute: ActivatedRoute,
    _eventDispatcher: EventBusDispatcherService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _firewallService: FirewallService
  ) {
    super(_eventDispatcher, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    super.onInit();
    this._subscribeToFirewallResolve();
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
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.FirewallDetails),
      this.paramId,
      tab.id
    ]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    if (isNullOrEmpty(id)) { return; }
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.firewallsListSource = new FirewallsListSource(
      this._apiService,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: McsFirewall) => {
      let resourceName = isNullOrEmpty(item.haGroupName) ? '' : item.haGroupName;
      return resourceName;
    };

    // Listen to all records changed
    this.firewallListing$ = this.firewallsListSource.findAllRecordsMapStream(keyFn).pipe(
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

  /**
   * Subcribes to firewall resolve
   */
  private _subscribeToFirewallResolve(): void {
    this.selectedFirewall$ = this.activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.firewall)),
      tap((firewall) => this._firewallService.setSelectedFirewall(firewall)),
      shareReplay(1)
    );
  }
}
