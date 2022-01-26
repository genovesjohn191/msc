import {
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsReportBillingService,
  McsReportBillingServiceGroup,
  McsReportBillingServiceSummary,
  McsReportBillingSummaryParams,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { StdDateFormatPipe } from '@app/shared';
import {
  addMonthsToDate,
  addYearsToDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { BillingSummaryService } from './billing.service';
import { DashboardExportDocumentManager } from '@app/features-shared/export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';

type tabGroupType = 'summary' | 'service' | 'tabular';

@Component({
  selector: 'mcs-billing',
  templateUrl: './billing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent implements OnInit, OnDestroy {
  public selectedTabId$: Observable<string>;
  public fcBillingAccount = new FormControl('');;

  private _isCsvDownloadInProgress: boolean = true;

  private _routerHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _billingSummariesCache = new BehaviorSubject<Array<McsReportBillingServiceGroup>>(null);

  public constructor(
    private _billingSummaryService: BillingSummaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe,
    private _injector: Injector,
  ) {
    this._registerEvents();
    this._subscribeToBillingAccountControlChanges();
  }

  public get headerDescription(): string {
    return this._translate.instant('reports.billing.description');
  }

  public get learnMoreLink(): string {
    return this._translate.instant('reports.billing.learnMoreLink');
  }

  public get statusIconKey(): string {
    return CommonDefinition.ASSETS_SVG_INFO;
  }

  public get csvDownloadInProgress(): boolean {
    return this._isCsvDownloadInProgress;
  }

  public ngOnInit(): void {
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routerHandler);
    this._billingSummariesCache.next(null);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.Billing,
      [tab.id as tabGroupType]
    );
  }

  public onClickExportCsv(): void {
    this._isCsvDownloadInProgress = true;
    this._changeDetectorRef.markForCheck();
    let dateParams = this._getAssociatedDates();

    let query = new McsReportBillingSummaryParams();
    query.microsoftChargeMonthRangeBefore = dateParams.before;
    query.microsoftChargeMonthRangeAfter = dateParams.after;

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_CONTENT_TYPE, 'text/csv'],
    ]);

    this._apiService.getBillingSummariesCsv(query, optionalHeaders).pipe(
      catchError(error => {
        this._isCsvDownloadInProgress = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe((response: Blob) => {
      this._isCsvDownloadInProgress = false;
      this._changeDetectorRef.markForCheck();

      DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.CsvDocument)
      .exportDocument(response, DashboardExportDocumentType.CsvDocument, this._injector)
    });
  }

  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }

  private _subscribeToBillingAccountControlChanges(): void {
    this.fcBillingAccount.valueChanges.pipe(
      takeUntil(this._destroySubject),
      startWith([null]),
      tap(accountIds => {
        let dateParams = this._getAssociatedDates();

        let query = new McsReportBillingSummaryParams();
        // query.billingAccountId = isNullOrEmpty(accountIds) ? null : accountIds[0];
        query.microsoftChargeMonthRangeBefore = dateParams.before;
        query.microsoftChargeMonthRangeAfter = dateParams.after;

        // Retrieve the cache records and filter it by account id
        this._billingSummaryService.billingSummaryProcessingStatus.setInProgress();
        let billingSummaryGroups = this._billingSummariesCache.getValue();
        if (!isNullOrEmpty(billingSummaryGroups)) {
          let updatedGroups = this._filterServicesRecords(billingSummaryGroups, accountIds);
          this._billingSummaryService.setBillingSummaries(updatedGroups || []);
          this._billingSummaryService.billingSummaryProcessingStatus.setSuccessful(updatedGroups);
        } else {
          this._subscribeToBillingSummaries(query, accountIds);
        }
      })
    ).subscribe();
  }

  private _subscribeToBillingSummaries(
    query?: McsReportBillingSummaryParams,
    billingAccountIds?: string[]
  ): void {
    this._apiService.getBillingSummaries(query).pipe(
      map(response => {
        this._isCsvDownloadInProgress = false;
        if (isNullOrEmpty(response?.collection)) { return []; }
        this._billingSummariesCache.next(response?.collection.slice());
        return this._filterServicesRecords(response?.collection, billingAccountIds);
      }),
      tap(filteredRecords => {
        this._billingSummaryService.setBillingSummaries(filteredRecords || []);
        this._billingSummaryService.billingSummaryProcessingStatus.setSuccessful(filteredRecords);
      }),
      catchError(error => {
        this._isCsvDownloadInProgress = false;
        this._billingSummaryService.billingSummaryProcessingStatus.setError();
        return throwError(() => error);
      })
    ).subscribe();
  }

  private _filterServicesRecords(
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

  private _getAssociatedDates(): { before: string, after: string } {
    // Need to cover the settings in which the date after should be greater than and before
    // should be less than equal to.
    let targetMonth = addMonthsToDate(new Date(), 1);
    targetMonth.setDate(1);

    let startDate = addYearsToDate(targetMonth, -1);
    let endDate = targetMonth;

    return {
      after: this._datePipe.transform(startDate, 'shortDateTime'),
      before: this._datePipe.transform(endDate, 'shortDateTime')
    };
  }
}
