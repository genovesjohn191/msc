import {
  of,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  map,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  McsAzureManagementService,
  McsAzureManagementServiceChild,
  McsFilterInfo,
  McsPermission,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import { AzureManagementServiceDetailsBase } from '../azure-management-service.base';
import { AzureManagementServiceService } from '../azure-management-service.service';

@Component({
  selector: 'mcs-azure-management-service-children',
  templateUrl: './azure-management-service-children.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AzureManagementServiceChildrenComponent extends AzureManagementServiceDetailsBase implements OnInit {

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public readonly azureManagementServiceChildrenDatasource: McsTableDataSource2<McsAzureManagementServiceChild>;
  public readonly azureManagementServiceChildrenColumns: McsFilterInfo[];

  private _azureManagementServiceChildrenCache: Observable<McsAzureManagementServiceChild[]>;
  private _azureManagementServiceChildrenChange = new BehaviorSubject<McsAzureManagementServiceChild[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    _AzureManagementServiceService: AzureManagementServiceService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_AzureManagementServiceService);

    this.azureManagementServiceChildrenDatasource = new McsTableDataSource2(this._getAzureManagementServiceChildren.bind(this));
    this.azureManagementServiceChildrenColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'name' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' })
    ];
    this.azureManagementServiceChildrenDatasource.registerColumnsFilterInfo(this.azureManagementServiceChildrenColumns);
  }

  public ngOnInit() {
    this.initializeBase();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsAzureManagementServiceChild): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Navigate to service request
   */
  public azureServiceRequestLink(service: McsAzureManagementServiceChild): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange) :
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Event that will automatically invoked when the Azure Management Service selection has been changed
   */
  protected azureManagementServiceSelectionChange(_azureManagementService: McsAzureManagementService): void {
    this._updateTableDataSource(_azureManagementService.id);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initializes the data source of the Azure Management Service Children table
   */
  private _updateTableDataSource(azureManagementServiceId: string): void {
    let azureManagementServiceChildrenApiSource: Observable<McsAzureManagementServiceChild[]>;
    if (!isNullOrEmpty(azureManagementServiceId)) {
      azureManagementServiceChildrenApiSource = this._apiService.getAzureManagementServiceChildren(azureManagementServiceId).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((response) => {
          this._azureManagementServiceChildrenCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._azureManagementServiceChildrenCache) ?
      azureManagementServiceChildrenApiSource : this._azureManagementServiceChildrenCache;

    tableDataSource.pipe(
      take(1),
      tap(dataRecords => this._azureManagementServiceChildrenChange.next(dataRecords || []))
    ).subscribe();
    this._changeDetectorRef.markForCheck();
  }

  private _getAzureManagementServiceChildren(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureManagementServiceChild>> {
    return this._azureManagementServiceChildrenChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
