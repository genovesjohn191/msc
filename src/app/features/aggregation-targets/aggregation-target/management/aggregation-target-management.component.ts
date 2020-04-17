import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import {
  McsBackUpAggregationTarget,
  inviewLevelText
} from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { AggregationTargetService } from '../aggregation-target.service';


@Component({
  selector: 'mcs-aggregation-target-management',
  templateUrl: './aggregation-target-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetManagementComponent implements OnInit, OnDestroy {
  public aggregationTarget$: Observable<McsBackUpAggregationTarget>;

  private _aggregationTargetChange = new BehaviorSubject<McsBackUpAggregationTarget>(null);
  private _destroySubject = new Subject<void>();

  constructor(private _aggregationTargetService: AggregationTargetService) { }

  public ngOnInit(): void {
    this._subscribeToAggregationTargetChange();
    this._listenToAggregationTargetSelection();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the selected server as an observable
   */
  private _subscribeToAggregationTargetChange(): void {
    this.aggregationTarget$ = this._aggregationTargetChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Returns the inview level label
   */
  public inviewLevelLabel(aggregationTarget: McsBackUpAggregationTarget): string {
    return inviewLevelText[aggregationTarget.inviewLevel];
  }

  /**
   * Listens to aggregation target selections
   */
  private _listenToAggregationTargetSelection(): void {
    this._aggregationTargetService.selectedAggregationTargetChange
      .pipe(takeUntil(this._destroySubject),
        tap((aggregationTarget) => {
          if (isNullOrEmpty(aggregationTarget)) { return; }
          this._aggregationTargetChange.next(aggregationTarget);
        })
      ).subscribe();
  }
}
