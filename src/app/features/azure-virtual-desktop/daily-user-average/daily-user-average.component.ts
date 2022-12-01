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
import { McsReportBillingAvdDailyAverageUser } from '@app/models';
import {
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from '../azure-virtual-desktop.service';

@Component({
  selector: 'mcs-avd-daily-user-average',
  templateUrl: './daily-user-average.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyUserAverageComponent implements OnInit, OnDestroy {
  public dataProcess: DataProcess<any>;
  public dailyAverage$: Observable<McsReportBillingAvdDailyAverageUser[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _avdService: AzureVirtualDesktopService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToDataProcess();
    this._subscribeToDailyAverage();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateChart(data: any): void {
  }

  private _subscribeToDataProcess(): void {
    this.dataProcess = this._avdService.dataProcess;
  }

  private _subscribeToDailyAverage(): void {
    this.dailyAverage$ = this._avdService.dailyUsersAverage$.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
