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
  finalize
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsRoutingTabBase,
  McsErrorHandlerService,
  McsDataStatusFactory,
  CoreRoutes,
  McsLoadingService
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
  public firewallsTextContent: any;
  public firewallTextContent: any;
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
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _loadingService: McsLoadingService,
    private _firewallsRepository: McsFirewallsRepository,
    private _firewallService: FirewallService
  ) {
    super(_router, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.firewallsTextContent = this._textContentProvider.content.firewalls;
    this.firewallTextContent = this._textContentProvider.content.firewalls.firewall;
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
   * Returns the firewall group name based on its ipaddress
   * @param ipAddress Ip address that served as the basis
   */
  public getFirewallGroupName(firewallMap: Map<string, McsFirewall[]>, ipAddress: string): string {
    let firewallGroup = firewallMap && firewallMap.get(ipAddress);
    if (isNullOrEmpty(firewallGroup)) { return ''; }

    let masterFirewall = firewallGroup.find((firewall) => firewall.haRole === 'Master');
    return isNullOrEmpty(masterFirewall) ? '' : masterFirewall.managementName;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    // Navigate route based on current active tab
    this.router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.FirewallDetail),
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
      let resourseName = isNullOrEmpty(item.managementIpAddress) ? '' :
        item.managementIpAddress;
      return resourseName;
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
    this._loadingService.showLoader(this.firewallTextContent.loading);
    this.selectedFirewall$ = this._firewallsRepository.getById(firewallId).pipe(
      catchError((error) => {
        // Handle common error status code
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
      tap((response) => {
        // this._setSelectedFirewallById(response.id);
        this._firewallService.setSelectedFirewall(response);
        this._changeDetectorRef.markForCheck();
      }),
      finalize(() => this._loadingService.hideLoader()),
      shareReplay(1)
    );
  }
}
