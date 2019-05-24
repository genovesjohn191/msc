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
  shareReplay
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsRoutingTabBase,
  McsDataStatusFactory,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  RouteKey,
  McsFirewall
} from '@app/models';
import { McsFirewallsRepository } from '@app/services';
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
    return CoreDefinition.ASSETS_SVG_COG;
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
    private _firewallsRepository: McsFirewallsRepository,
    private _firewallService: FirewallService
  ) {
    super(_eventDispatcher, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    super.onInit();
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
    this._subscribeToFirewallById(id);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.firewallsListSource = new FirewallsListSource(
      this._firewallsRepository,
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
   * Subscribes to firewall by ID by creating the observable
   * @param firewallId Firewall identification
   */
  private _subscribeToFirewallById(firewallId: string): void {
    this.selectedFirewall$ = this._firewallsRepository.getByIdAsync(firewallId).pipe(
      tap((response) => {
        this._firewallService.setSelectedFirewall(response);
        this._changeDetectorRef.markForCheck();
      }),
      shareReplay(1)
    );
  }
}
