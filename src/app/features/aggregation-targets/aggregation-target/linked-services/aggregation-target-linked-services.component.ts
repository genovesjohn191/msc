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
  McsBackUpAggregationTarget,
  McsBatLinkedService,
  McsFilterInfo,
  McsPermission,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import { AggregationTargetDetailsBase } from '../aggregation-target.base';
import { AggregationTargetService } from '../aggregation-target.service';

@Component({
  selector: 'mcs-aggregation-target-linked-services',
  templateUrl: './aggregation-target-linked-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetLinkedServicesComponent extends AggregationTargetDetailsBase implements OnInit {

  public readonly batLinkedServicesDatasource: McsTableDataSource2<McsBatLinkedService>;
  public readonly batLinkedServicesColumns: McsFilterInfo[];

  private _batLinkedServicesCache: Observable<McsBatLinkedService[]>;
  private _batLinkedServicesChange = new BehaviorSubject<McsBatLinkedService[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    _aggregationTargetService: AggregationTargetService,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_aggregationTargetService);

    this.batLinkedServicesDatasource = new McsTableDataSource2(this._getBatLinkedServices.bind(this));
    this.batLinkedServicesColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'associatedServer' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceType' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'dailySchedule' })
    ];
    this.batLinkedServicesDatasource.registerColumnsFilterInfo(this.batLinkedServicesColumns);
  }

  public ngOnInit() {
    this.initializeBase();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Returns Unknown if the property is empty
   * @param value value of the property
   */
  public linkedServicePropertyLabel(value: string): string {
    return isNullOrEmpty(value) ? 'Unknown' : value;
  }

  /**
   * Navigate to aggregation target details page
   * @param aggregationTarget Aggregation Target to view the details
   */
  public navigateToAssociatedServer(linkedService: McsBatLinkedService): void {
    if (!this.hasAccessToService(linkedService)) { return; }

    let associatedServerId = getSafeProperty(linkedService, (obj) => obj.associatedServer.id);
    if (isNullOrEmpty(associatedServerId)) { return; }
    this._navigationService.navigateTo(
      RouteKey.ServerDetails, [associatedServerId, CoreRoutes.getNavigationPath(RouteKey.ServerDetailsServices)]
    );
  }

  /**
   * Return true if the user has access to the selected linked service
   */
  public hasAccessToService(linkedService: McsBatLinkedService): boolean {
    return this._accessControlService.hasPermission([
      McsPermission.ManagedCloudVmAccess,
      McsPermission.SelfManagedCloudVmAccess,
      McsPermission.DedicatedVmAccess]);
  }

  /**
   * Event that will automatically invoked when the aggregattion selection has been changed
   */
  protected aggregationTargetSelectionChange(_aggregationTarget: McsBackUpAggregationTarget): void {
    this._updateTableDataSource(_aggregationTarget.id);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initializes the data source of the bat linked services table
   */
  private _updateTableDataSource(batId: string): void {
    let batLinkedServicesApiSource: Observable<McsBatLinkedService[]>;
    if (!isNullOrEmpty(batId)) {
      batLinkedServicesApiSource = this._apiService.getBackupAggregationTargetLinkedServices(batId).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((response) => {
          this._batLinkedServicesCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._batLinkedServicesCache) ?
      batLinkedServicesApiSource : this._batLinkedServicesCache;

    tableDataSource.pipe(
      take(1),
      tap(dataRecords => this._batLinkedServicesChange.next(dataRecords || []))
    ).subscribe();
    this._changeDetectorRef.markForCheck();
  }

  private _getBatLinkedServices(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsBatLinkedService>> {
    return this._batLinkedServicesChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
