import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsAccessControlService,
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsAzureManagementService,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { AzureManagementServiceService } from './azure-management-service.service';

// Add another group type in here if you have an additional tab
type tabGroupType = 'overview';

@Component({
  selector: 'mcs-azure-management-service',
  templateUrl: './azure-management-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AzureManagementServiceComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsAzureManagementService>;
  public readonly dataEvents: McsTableEvents<McsAzureManagementService>;
  public selectedAzureManagementService$: Observable<McsAzureManagementService>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _accessControlService: McsAccessControlService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _azureManagementServiceService: AzureManagementServiceService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getAzureManagementServices.bind(this),
      {
        sortPredicate: this._sortAzureManagementServicePredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('azureManagementServices.loading'),
          emptyText: _translate.instant('azureManagementServices.noData'),
          errorText: _translate.instant('azureManagementServices.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeAzureManagementServices as any
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToAzureManagementServiceResolve();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public navigateToDetails(azureManagementService: McsAzureManagementService): void {
    this._navigationService.navigateTo(RouteKey.AzureManagementServicesDetails, [azureManagementService.id]);
  }

  public hasAccessToServiceReuqest(service: McsAzureManagementService): boolean {
    let propertyIsAvd = service.productType === 'AzureVirtualDesktop';
    let hasOrderEditPermission = this._accessControlService.hasPermission(['OrderEdit']);
    return propertyIsAvd && hasOrderEditPermission && !isNullOrEmpty(service.serviceId);
  }

  public navigateToServiceRequest(service: McsAzureManagementService): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange) :
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.AzureManagementServicesDetails,
      [this._azureManagementServiceService.getAzureManagementServiceId(), tab.id as tabGroupType]
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let azureManagementServiceId = params.get('id');
        if (isNullOrEmpty(azureManagementServiceId)) { return; }

        this._azureManagementServiceService.setAzureManagementServiceId(azureManagementServiceId);
      })
    ).subscribe();
  }

  /**
   * Gets the entity listing from API
   */
  private _getAzureManagementServices(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsAzureManagementService>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getAzureManagementServices(queryParam).pipe(
      map((azureManagementServices) => {
        return new McsListviewContext<McsAzureManagementService>(
          azureManagementServices?.collection
        );
      })
    );
  }

  /**
   * Subcribes to Azure Management Service resolve
   */
  private _subscribeToAzureManagementServiceResolve(): void {
    this.selectedAzureManagementService$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.azureManagementService)),
      tap((azureManagementService) => this._azureManagementServiceService.setSelectedAzureManagementService(azureManagementService)),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortAzureManagementServicePredicate(first: McsAzureManagementService, second: McsAzureManagementService): number {
    return compareStrings(first.description, second.description);
  }

  /**
   * Register Event dispatchers
   */
  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
