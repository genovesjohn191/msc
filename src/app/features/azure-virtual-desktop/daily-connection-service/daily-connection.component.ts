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
import { FormControl } from '@angular/forms';
import { McsReportBillingAvdDailyUser } from '@app/models';
import {
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from '../azure-virtual-desktop.service';

@Component({
  selector: 'mcs-avd-daily-connection',
  templateUrl: './daily-connection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyConnectionServiceComponent implements OnInit, OnDestroy {
  public dataProcess: DataProcess<any>;
  public dailyUsers$: Observable<McsReportBillingAvdDailyUser[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _avdService: AzureVirtualDesktopService
  ) {
  }

  public get fcMonth(): FormControl {
    return this._avdService.fcMonth;
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
    this.dailyUsers$ = this._avdService.dailyUsersService$.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
