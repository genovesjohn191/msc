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
  McsReportBillingServiceGroup,
  McsReportBillingSummaryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from '../azure-virtual-desktop.service';

@Component({
  selector: 'mcs-service-cost',
  templateUrl: './service-cost.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceCostComponent implements OnInit, OnDestroy {
  public readonly exportProcess = new DataProcess();
  public dataProcess: DataProcess<any>;
  public billingServices$: Observable<McsReportBillingServiceGroup[]>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _injector: Injector,
    private _apiService: McsApiService,
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

  public onExportCsv(): void {
    this.exportProcess.setInProgress();
    let dateParams = this._avdService.getAssociatedDates();

    let query = new McsReportBillingSummaryParams();
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_ACCEPT, 'text/csv'],
    ]);

    this._apiService.getBillingSummariesCsv(query, optionalHeaders).pipe(
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
    this.billingServices$ = this._avdService.billingServices$.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
