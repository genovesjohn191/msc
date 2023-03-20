import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  exhaustMap,
  finalize,
  forkJoin,
  map,
  of,
  startWith,
  tap,
  BehaviorSubject,
  EMPTY,
  Observable
} from 'rxjs';

import {
  EventEmitter,
  Injectable,
  Injector
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DashboardExportDocumentManager,
  DashboardExportDocumentType
} from '@app/features-shared';
import {
  McsReportBillingAvdDailyAverageUser,
  McsReportBillingAvdDailyAverageUsersParam,
  McsReportBillingAvdDailyUser,
  McsReportBillingAvdDailyUsersParam,
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary,
  McsReportBillingSummaryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import { StdDateFormatPipe } from '@app/shared';
import {
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  compareJsons,
  isNullOrEmpty,
  isNullOrUndefined,
  CommonDefinition,
  DataProcess
} from '@app/utilities';

// Note: this should match the routing path under constants def.
export type TabGroupType = 'daily-user-service' | 'daily-user-average' | 'service-cost' | 'daily-connection-service';

@Injectable()
export class AzureVirtualDesktopService {
  public dataProcess = new DataProcess();
  public fcMonth = new FormControl(new Date().getMonth(), []);
  public fcMonthConnection = new FormControl(new Date().getMonth(), []);

  private _billingAccountIdChange = new EventEmitter<string>();

  private _billingServicesChange = new BehaviorSubject<McsReportBillingServiceGroup[]>(null);
  private _dailyUsersServiceChange = new BehaviorSubject<McsReportBillingAvdDailyUser[]>(null);
  private _dailyConnectionsServiceChange = new BehaviorSubject<McsReportBillingAvdDailyUser[]>(null);
  private _dailyUsersAverageChange = new BehaviorSubject<McsReportBillingAvdDailyAverageUser[]>(null);

  constructor(
    private _injector: Injector,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe
  ) {
    this._subscribeToBillingAccountChange();
  }

  public get billingAccountId$(): Observable<string> {
    return this._billingAccountIdChange.pipe(
      distinctUntilChanged()
    );
  }

  public get billingServices$(): Observable<McsReportBillingServiceGroup[]> {
    return this._billingServicesChange.pipe(
      distinctUntilChanged()
    );
  }

  public get dailyUsersService$(): Observable<McsReportBillingAvdDailyUser[]> {
    return this._dailyUsersServiceChange.pipe(
      distinctUntilChanged()
    );
  }

  public get dailyConnectionsService$(): Observable<McsReportBillingAvdDailyUser[]> {
    return this._dailyConnectionsServiceChange.pipe(
      distinctUntilChanged()
    );
  }

  public get dailyUsersAverage$(): Observable<McsReportBillingAvdDailyAverageUser[]> {
    return this._dailyUsersAverageChange.pipe(
      distinctUntilChanged()
    );
  }

  public setBillingAccountId(accountId: string): void {
    this._billingAccountIdChange.emit(accountId);
  }

  public getAssociatedDates(coverage: 'daily' | 'monthly' = 'monthly', monthIndex?: number): { before: string, after: string } {
    // Need to cover the settings in which the date after should be greater than and before
    // should be less than equal to.
    let isDailyCoverage = coverage === 'daily';
    let currentDate = new Date();
    let targetMonth = addMonthsToDate(currentDate, isDailyCoverage ? 0 : 1)
    targetMonth.setDate(1);

    if (!isNullOrUndefined(monthIndex)) {
      targetMonth.setMonth(monthIndex);

      if (monthIndex > currentDate.getMonth()) {
        targetMonth.setFullYear(currentDate.getFullYear() - 1);
      }
    }

    let startDate = isDailyCoverage ? targetMonth : addYearsToDate(targetMonth, -1);
    let endDate = isDailyCoverage ? addDaysToDate(addMonthsToDate(targetMonth, 1), -1) : targetMonth;

    return {
      after: this._datePipe.transform(startDate, 'shortDateTime'),
      before: this._datePipe.transform(endDate, 'shortDateTime')
    };
  }

  public exportCsvByTab(tab: TabGroupType): Observable<any> {
    let tabGroupMap = new Map<TabGroupType, () => Observable<any>>();

    tabGroupMap.set(null, this._exportDailyUsersCsv.bind(this));
    tabGroupMap.set('daily-user-service', this._exportDailyUsersCsv.bind(this));
    tabGroupMap.set('daily-user-average', this._exportDailyAverageCsv.bind(this));
    tabGroupMap.set('service-cost', this._exportBillingSummariesCsv.bind(this));
    tabGroupMap.set('daily-connection-service', this._exportDailyUsersCsv.bind(this));

    let targetFunc = tabGroupMap.get(tab);
    if (isNullOrEmpty(targetFunc)) { return of(null); }

    return targetFunc();
  }

  private _exportBillingSummariesCsv(): Observable<any> {
    let dateParams = this.getAssociatedDates();

    let query = new McsReportBillingSummaryParams();
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_ACCEPT, 'text/csv'],
    ]);

    return this._apiService.getBillingSummariesCsv(query, optionalHeaders).pipe(
      tap((response: Blob) => {
        if (isNullOrEmpty(response)) { return; }

        DashboardExportDocumentManager.initializeFactories()
          .getCreationFactory(DashboardExportDocumentType.CsvDocument)
          .exportDocument(response, DashboardExportDocumentType.CsvDocument, this._injector);
      })
    );
  }

  public _exportDailyUsersCsv(): Observable<any> {
    let dateParams = this.getAssociatedDates();

    let query = new McsReportBillingAvdDailyUsersParam();
    query.dateRangeBefore = dateParams.before;
    query.dateRangeAfter = dateParams.after;

    return this._apiService.getAvdDailyUsersCsv(query).pipe(
      tap((response: Blob) => {
        if (isNullOrEmpty(response)) { return; }

        DashboardExportDocumentManager.initializeFactories()
          .getCreationFactory(DashboardExportDocumentType.CsvDocument)
          .exportDocument(response, DashboardExportDocumentType.CsvDocument, this._injector);
      })
    );
  }

  public _exportDailyAverageCsv(): Observable<any> {
    let dateParams = this.getAssociatedDates();

    let query = new McsReportBillingAvdDailyAverageUsersParam();
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    return this._apiService.getAvdDailyAverageUsersCsv(query).pipe(
      tap((response: Blob) => {
        if (isNullOrEmpty(response)) { return; }

        DashboardExportDocumentManager.initializeFactories()
          .getCreationFactory(DashboardExportDocumentType.CsvDocument)
          .exportDocument(response, DashboardExportDocumentType.CsvDocument, this._injector);
      })
    );
  }

  private _subscribeToBillingAccountChange(): void {
    this.dataProcess.setInProgress();

    combineLatest([
      this._billingAccountIdChange,
      this.fcMonth.valueChanges.pipe(startWith(new Date().getMonth()))
    ]).pipe(
      distinctUntilChanged((prev, next) => compareJsons(prev, next) === 0),
      exhaustMap(([accountId, monthIndex]) => {
        this.dataProcess.setInProgress();
        return forkJoin([
          this._getBillingServices(accountId),
          this._getBillingAvdDailyUsersService(accountId, +monthIndex),
          this._getBillingAvdDailyUsersAverage(accountId)
        ]).pipe(
          finalize(() => this.dataProcess.setCompleted())
        )
      })
    ).subscribe();

    combineLatest([
      this._billingAccountIdChange,
      this.fcMonthConnection.valueChanges.pipe(startWith(new Date().getMonth()))
    ]).pipe(
      distinctUntilChanged((prev, next) => compareJsons(prev, next) === 0),
      exhaustMap(([accountId, monthIndex]) => {
        this.dataProcess.setInProgress();
        return forkJoin([
          this._getBillingAvdDailyConnectionsService(accountId, +monthIndex),
        ]).pipe(
          finalize(() => this.dataProcess.setCompleted())
        )
      })
    ).subscribe();
  }

  private _getBillingAvdDailyUsersService(accountId: string, monthIndex: number): Observable<McsReportBillingAvdDailyUser[]> {
    let dateParams = this.getAssociatedDates('daily', monthIndex);

    let query = new McsReportBillingAvdDailyUsersParam();
    query.billingAccountId = accountId;
    query.dateRangeBefore = dateParams.before;
    query.dateRangeAfter = dateParams.after;

    return this._apiService.getAvdDailyUsers(query).pipe(
      catchError(error => {
        this._dailyUsersServiceChange.next([]);
        return EMPTY;
      }),
      map(response => response?.collection),
      tap(records => {
        this._dailyUsersServiceChange.next(records || []);
      })
    );
  }

  private _getBillingAvdDailyConnectionsService(accountId: string, monthIndex: number): Observable<McsReportBillingAvdDailyUser[]> {
    let dateParams = this.getAssociatedDates('daily', monthIndex);

    let query = new McsReportBillingAvdDailyUsersParam();
    query.billingAccountId = accountId;
    query.dateRangeBefore = dateParams.before;
    query.dateRangeAfter = dateParams.after;

    return this._apiService.getAvdDailyUsers(query).pipe(
      catchError(error => {
        this._dailyConnectionsServiceChange.next([]);
        return EMPTY;
      }),
      map(response => response?.collection),
      tap(records => {
        this._dailyConnectionsServiceChange.next(records || []);
      })
    );
  }

  private _getBillingAvdDailyUsersAverage(accountId: string): Observable<McsReportBillingAvdDailyAverageUser[]> {
    let dateParams = this.getAssociatedDates('monthly');

    let query = new McsReportBillingAvdDailyAverageUsersParam();
    query.billingAccountId = accountId;
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    return this._apiService.getAvdDailyAverageUsers(query).pipe(
      catchError(error => {
        this._dailyUsersAverageChange.next([]);
        return EMPTY;
      }),
      map(response => response?.collection),
      tap(records => {
        this._dailyUsersAverageChange.next(records || []);
      })
    );
  }

  private _getBillingServices(accountId: string): Observable<McsReportBillingServiceGroup[]> {
    let dateParams = this.getAssociatedDates();

    let query = new McsReportBillingSummaryParams();
    query.billingAccountId = accountId;
    query.productTypes = 'AzureVirtualDesktop';
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    return this._apiService.getBillingSummaries(query).pipe(
      catchError(error => {
        this._billingServicesChange.next([]);
        return EMPTY;
      }),
      map(response => {
        if (isNullOrEmpty(response?.collection)) { return []; }
        return this._filterBillingServicesRecords(response?.collection, [accountId]);
      }),
      tap(filteredRecords => {
        this._billingServicesChange.next(filteredRecords || []);
      })
    );
  }

  private _filterBillingServicesRecords(
    groupRecords: McsReportBillingServiceGroup[],
    billingAccountIds: string[]
  ): McsReportBillingServiceGroup[] {
    if (isNullOrEmpty(billingAccountIds)) { return groupRecords; }

    let recordGroups = new Array<McsReportBillingServiceGroup>();
    groupRecords?.forEach(groupRecord => {
      let tempRecordGroup = Object.assign(new McsReportBillingServiceGroup(), groupRecord);
      tempRecordGroup.parentServices = [];

      groupRecord.parentServices?.forEach(parentService => {
        let tempChildServices = new Array<McsReportBillingServiceSummary>();

        // Add child item
        parentService.childBillingServices.forEach(childService => {
          let childFound = billingAccountIds.find(accountId => accountId === childService.billingAccountId);
          if (isNullOrEmpty(childFound)) { return; }
          tempChildServices.push(childService);
        });

        let tempParentService = Object.assign(new McsReportBillingService(), parentService);
        tempParentService.childBillingServices = [];
        if (!isNullOrEmpty(tempChildServices)) {
          tempParentService.childBillingServices = tempChildServices;
        }
        let parentServiceFound = !!billingAccountIds.find(
          accountId => parentService.billingAccountId === accountId
        );

        let parentServiceIncluded = !isNullOrEmpty(tempChildServices) || !isNullOrEmpty(parentServiceFound);
        if (parentServiceIncluded) {
          tempRecordGroup.parentServices.push(tempParentService);
        }
      });

      if (!isNullOrEmpty(tempRecordGroup.parentServices)) {
        recordGroups.push(tempRecordGroup);
      }
    });
    return recordGroups;
  }
}
