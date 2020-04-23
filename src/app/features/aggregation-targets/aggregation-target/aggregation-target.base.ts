import {
  Observable,
  Subject
} from 'rxjs';
import {
  tap,
  shareReplay
} from 'rxjs/operators';
import { McsBackUpAggregationTarget } from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { AggregationTargetService } from './aggregation-target.service';

export abstract class AggregationTargetDetailsBase {
  public selectedAggregationTarget$: Observable<McsBackUpAggregationTarget>;
  private _baseDestroySubject = new Subject<void>();

  constructor(protected _aggregationTargetService: AggregationTargetService) { }

  /**
   * Initializes the based class implementation
   */
  protected initializeBase(): void {
    this._subscribeToAggregationTargetSelectionChange();
  }

  /**
   * Destroys all the resources of the base class
   */
  protected destroyBase(): void {
    unsubscribeSafely(this._baseDestroySubject);
  }

  /**
   * Set selected aggregation target state (true: spinner, false: normal)
   * @param state State to be set in the processing flag of aggregation target
   */
  protected setSelectedAggregationTargetState(aggregationTarget: McsBackUpAggregationTarget, state: boolean): void {
    if (isNullOrEmpty(aggregationTarget)) { return; }
    aggregationTarget.isProcessing = state;
  }

  protected abstract aggregationTargetSelectionChange(aggregationTarget: McsBackUpAggregationTarget): void;

  /**
   * Listens to aggregation target selection change
   */
  private _subscribeToAggregationTargetSelectionChange(): void {
    this.selectedAggregationTarget$ = this._aggregationTargetService.selectedAggregationTargetChange().pipe(
      tap((aggregationTarget) => this.aggregationTargetSelectionChange(aggregationTarget)),
      shareReplay(1)
    );
  }
}
