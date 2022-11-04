import {
  throwError,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  DashboardExportDocumentManager,
  DashboardExportDocumentType
} from '@app/features-shared';
import {
  McsReportBillingAvdDailyAverageUser,
  McsReportBillingAvdDailyAverageUsersParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
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
  public readonly exportProcess = new DataProcess();
  public dataProcess: DataProcess<any>;
  public dailyAverage$: Observable<McsReportBillingAvdDailyAverageUser[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _injector: Injector,
    private _apiService: McsApiService,
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

  public onExportCsv(): void {
    this.exportProcess.setInProgress();
    let dateParams = this._avdService.getAssociatedDates();

    let query = new McsReportBillingAvdDailyAverageUsersParam();
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    this._apiService.getAvdDailyAverageUsersCsv(query).pipe(
      catchError(error => {
        this.exportProcess.setError();
        return throwError(() => error);
      }),
      tap((response: Blob) => {
        if (isNullOrEmpty(response)) { return; }

        this.exportProcess.setCompleted();
        DashboardExportDocumentManager.initializeFactories()
          .getCreationFactory(DashboardExportDocumentType.CsvDocument)
          .exportDocument(response, DashboardExportDocumentType.CsvDocument, this._injector);
      })
    ).subscribe();
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
