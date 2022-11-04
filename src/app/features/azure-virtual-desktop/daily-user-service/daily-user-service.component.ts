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
import { FormControl } from '@angular/forms';
import {
  DashboardExportDocumentManager,
  DashboardExportDocumentType
} from '@app/features-shared';
import {
  McsReportBillingAvdDailyUser,
  McsReportBillingAvdDailyUsersParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from '../azure-virtual-desktop.service';

@Component({
  selector: 'mcs-avd-daily-user-service',
  templateUrl: './daily-user-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyUserServiceComponent implements OnInit, OnDestroy {
  public readonly exportProcess = new DataProcess();
  public dataProcess: DataProcess<any>;
  public dailyUsers$: Observable<McsReportBillingAvdDailyUser[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _injector: Injector,
    private _apiService: McsApiService,
    private _avdService: AzureVirtualDesktopService
  ) {
  }

  public get fcMonth(): FormControl {
    return this._avdService.fcMonth;
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

  public onExportCsv(): void {
    this.exportProcess.setInProgress();
    let dateParams = this._avdService.getAssociatedDates();

    let query = new McsReportBillingAvdDailyUsersParam();
    query.dateRangeBefore = dateParams.before;
    query.dateRangeAfter = dateParams.after;

    this._apiService.getAvdDailyUsersCsv(query).pipe(
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

  private _subscribeToDailyUsers(): void {
    this.dailyUsers$ = this._avdService.dailyUsersService$.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
