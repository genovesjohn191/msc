import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsTableListingBase,
  IMcsColumnManager,
  McsNavigationService,
  McsAccessControlService
} from '@app/core';
import {
  McsStorageBackUpAggregationTarget,
  McsQueryParam,
  McsApiCollection,
  RouteKey,
  InviewLevel,
  inviewLevelText,
  McsFeatureFlag
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-aggregation-targets',
  templateUrl: './aggregation-targets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetsComponent extends McsTableListingBase<McsStorageBackUpAggregationTarget> implements IMcsColumnManager {

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeAggregationTargets
    });
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_AGGREGATION_TARGETS_LISTING;
  }

  public inviewLevelLabel(inview: InviewLevel): string {
    return inviewLevelText[inview];
  }

  /**
   * Navigate to aggregation target details page
   * @param aggregationTarget Aggregation Target to view the details
   */
  public navigateToAggregationTarget(aggregationTarget: McsStorageBackUpAggregationTarget): void {
    let hasAggregationTargetFlag = this._accessControlService.hasAccessToFeature(McsFeatureFlag.AddonBackupAggregationTargetDetailsView);
    if (!hasAggregationTargetFlag || isNullOrEmpty(aggregationTarget)) { return; }

    this._navigationService.navigateTo(RouteKey.BackupAggregationTargetsDetails, [aggregationTarget.serviceId]);
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsStorageBackUpAggregationTarget>> {
    return this._apiService.getStorageBackupAggregationTargets(query);
  }
}
