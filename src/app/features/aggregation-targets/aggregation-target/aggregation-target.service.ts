import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { McsBackUpAggregationTarget } from '@app/models';

@Injectable()
export class AggregationTargetService {
  /**
   * This will notify the subscriber everytime the aggregation target is selected or
   * everytime there are new data from the selected aggregation target
   */
  public selectedAggregationTargetChange: BehaviorSubject<McsBackUpAggregationTarget>;
  private _aggregationTargetId: string;

  /**
   * Get the selected aggregation target on the listing panel
   */
  private _selectedAggregationTarget: McsBackUpAggregationTarget;
  public get selectedAggregationTarget(): McsBackUpAggregationTarget {
    return this._selectedAggregationTarget;
  }

  constructor() {
    this.selectedAggregationTargetChange = new BehaviorSubject<McsBackUpAggregationTarget>(null);
    this._selectedAggregationTarget = new McsBackUpAggregationTarget();
  }

  /**
   * Set aggregation target data to the stream (MCS API response)
   * @param id Aggregation target identification
   */
  public setSelectedAggregationTarget(aggregationTarget: McsBackUpAggregationTarget): void {
    this._selectedAggregationTarget = aggregationTarget;
    this.selectedAggregationTargetChange.next(aggregationTarget);
  }

  /**
   * Sets the aggregation target id based on the provided string
   * @param aggregationTargetId Aggregation target id to be set
   */
  public setAggregationTargetId(aggregationTargetId: string): void {
    this._aggregationTargetId = aggregationTargetId;
  }

  /**
   * Returns the aggregation target id
   */
  public getAggregationTargetId(): string {
    return this._aggregationTargetId;
  }
}
