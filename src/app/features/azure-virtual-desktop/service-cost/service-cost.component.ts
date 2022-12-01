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
import { McsReportBillingServiceGroup } from '@app/models';
import {
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from '../azure-virtual-desktop.service';

@Component({
  selector: 'mcs-service-cost',
  templateUrl: './service-cost.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceCostComponent implements OnInit, OnDestroy {
  public dataProcess: DataProcess<any>;
  public billingServices$: Observable<McsReportBillingServiceGroup[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _avdService: AzureVirtualDesktopService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToDataProcess();
    this._subscribeToDailyUsers();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateChart(data: any): void {
  }

  private _subscribeToDataProcess(): void {
    this.dataProcess = this._avdService.dataProcess;
  }

  private _subscribeToDailyUsers(): void {
    this.billingServices$ = this._avdService.billingServices$.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
