import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  McsBackUpAggregationTarget,
  inviewLevelText
} from '@app/models';
import { AggregationTargetService } from '../aggregation-target.service';
import { AggregationTargetDetailsBase } from '../aggregation-target.base';


@Component({
  selector: 'mcs-aggregation-target-management',
  templateUrl: './aggregation-target-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetManagementComponent extends AggregationTargetDetailsBase implements OnInit, OnDestroy {

  constructor(
    _aggregationTargetService: AggregationTargetService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_aggregationTargetService);
  }

  public ngOnInit(): void {
    this.initializeBase();
  }

  public ngOnDestroy(): void {
    this.destroyBase();
  }

  /**
   * Returns the inview level label
   */
  public inviewLevelLabel(aggregationTarget: McsBackUpAggregationTarget): string {
    return inviewLevelText[aggregationTarget.inviewLevel];
  }

  /**
   * Returns the value of daily quota in GB with unit
   */
  public dailyQuotaInGB(quotaMb: number): string {
    let dataConversion = 1000;
    return `${quotaMb / dataConversion} GB`;
  }

  /**
   * Event that will automatically invoked when the aggregattion selection has been changed
   */
  protected aggregationTargetSelectionChange(): void {
    this._changeDetectorRef.markForCheck();
  }
}
