import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { McsBackUpAggregationTarget } from '@app/models';
import {
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class AggregationTargetService {
  public _selectedAggregationTargetChange: BehaviorSubject<McsBackUpAggregationTarget>;
  private _aggregationTargetId: string;

  constructor() {
    this._selectedAggregationTargetChange = new BehaviorSubject<McsBackUpAggregationTarget>(null);
  }

  /**
   * Event that emits when the selected item has been changed
   */
  public selectedAggregationTargetChange(): Observable<McsBackUpAggregationTarget> {
    return this._selectedAggregationTargetChange.asObservable().pipe(
      distinctUntilChanged(),
      filter((aggregationTarget) => !isNullOrEmpty(aggregationTarget))
    );
  }

  /**
   * Set aggregation target data to the stream (MCS API response)
   * @param aggregationTarget selected Aggregation target
   */
  public setSelectedAggregationTarget(aggregationTarget: McsBackUpAggregationTarget): void {
    this._selectedAggregationTargetChange.next(aggregationTarget);
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
