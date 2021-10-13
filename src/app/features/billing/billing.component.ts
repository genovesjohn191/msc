import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
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

type tabGroupType = 'summary' | 'service' | 'tabular';

@Component({
  selector: 'mcs-billing',
  templateUrl: './billing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent implements OnInit, OnDestroy {
  public selectedTabId$: Observable<string>;
  public fcBillingAccount = new FormControl('');;

  private _routerHandler: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _billingSummaryService: BillingSummaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe
  ) {
    this._registerEvents();
    this._subscribeToBillingAccountControlChanges();
  }

  public get headerDescription(): string {
    return this._translate.instant('reports.billing.description');
  }

  public get headerSecondDescription(): string {
    return this._translate.instant('reports.billing.secondDescription');
  }

  public get learnMoreLink(): string {
    return this._translate.instant('reports.billing.learnMoreLink');
  }

  public get statusIconKey(): string {
    return CommonDefinition.ASSETS_SVG_INFO;
  }

  public ngOnInit(): void {
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.Billing,
      [tab.id as tabGroupType]
    );
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
        query.billingAccountId = isNullOrEmpty(accountIds) ? null : accountIds[0];
        query.microsoftChargeMonthRangeBefore = dateParams.before;
        query.microsoftChargeMonthRangeAfter = dateParams.after;
        this._subscribeToBillingSummaries(query);
      })
    ).subscribe();
  }

  private _subscribeToBillingSummaries(query?: McsReportBillingSummaryParams): void {
    this._apiService.getBillingSummaries(query).pipe(
      tap(response => {
        this._billingSummaryService.setBillingSummaries(response?.collection || []);
      })
    ).subscribe();
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
