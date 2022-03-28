import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsPlannedWork } from '@app/models';
import {
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';

import { PlannedWorkDetailsService } from '../planned-work-details.service';

@Component({
  selector: 'mcs-planned-work-overview',
  templateUrl: './planned-work-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlannedWorkOverviewComponent implements OnInit, OnDestroy {
  public selectedPlannedWork$: Observable<McsPlannedWork>;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _plannedWorkDetailsService: PlannedWorkDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToPlannedWorkDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeToPlannedWorkDetails(): void {
    this.selectedPlannedWork$ = this._plannedWorkDetailsService.getPlannedWorkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  public get timeZone(): string {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(isNullOrUndefined(timeZone) || !isNaN(+timeZone)){
      return 'Times displayed are in your local time zone.';
    }
    return 'Time Zone: ' + timeZone;
  }
}
