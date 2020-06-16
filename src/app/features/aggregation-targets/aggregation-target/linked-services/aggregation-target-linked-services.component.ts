import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsBatLinkedService,
  McsBackUpAggregationTarget,
  RouteKey,
  McsPermission,
  McsFeatureFlag,
  BatLinkedServiceType
} from '@app/models';
import {
  McsTableDataSource,
  McsNavigationService,
  CoreRoutes,
  McsAccessControlService
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { AggregationTargetService } from '../aggregation-target.service';
import { AggregationTargetDetailsBase } from '../aggregation-target.base';

interface LinkedServicesConfig {
  featureFlags: McsFeatureFlag[];
}

@Component({
  selector: 'mcs-aggregation-target-linked-services',
  templateUrl: './aggregation-target-linked-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetLinkedServicesComponent extends AggregationTargetDetailsBase implements OnInit {

  public batLinkedServicesDatasource: McsTableDataSource<McsBatLinkedService>;
  public batLinkedServicesColumns: string[];
  private _batLinkedServicesCache: Observable<McsBatLinkedService[]>;
  private _linkedServicesConfigMap: Map<BatLinkedServiceType, LinkedServicesConfig>;

  constructor(
    _aggregationTargetService: AggregationTargetService,
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_aggregationTargetService);
    this.batLinkedServicesColumns = [];
    this.batLinkedServicesDatasource = new McsTableDataSource();
    this._linkedServicesConfigMap = new Map();
  }

  public ngOnInit() {
    this.initializeBase();
    this._setDataColumns();
    this._createLinkedServicesConfigMap();
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
    let linkedServiceConfig = this._linkedServicesConfigMap.get(linkedService.serviceType);
    return this._accessControlService.hasAccess(
      [McsPermission.CloudVmAccess, McsPermission.DedicatedVmAccess],
      linkedServiceConfig.featureFlags
    );
  }

  /**
   * Event that will automatically invoked when the aggregattion selection has been changed
   */
  protected aggregationTargetSelectionChange(_aggregationTarget: McsBackUpAggregationTarget): void {
    this._updateTableDataSource(_aggregationTarget.id);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.batLinkedServicesColumns = Object.keys(
      this._translateService.instant('aggregationTarget.linkedServices.columnHeaders')
    );
    if (isNullOrEmpty(this.batLinkedServicesColumns)) {
      throw new Error('column definition for Backup Aggregation Target Linked Services was not defined');
    }
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
    this.batLinkedServicesDatasource.updateDatasource(tableDataSource);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initializes the linked service config map
   */
  private _createLinkedServicesConfigMap(): void {
    this._linkedServicesConfigMap.set(BatLinkedServiceType.VmBackup, { featureFlags: [McsFeatureFlag.AddonVmBackupView] });
    this._linkedServicesConfigMap.set(BatLinkedServiceType.ServerBackup, { featureFlags: [McsFeatureFlag.AddonServerBackupView] });
  }
}
