import {
  throwError,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  McsOption,
  McsReportBillingServiceGroup,
  McsReportBillingSummaryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import {
  compareDates,
  getDateOnly,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../report-widget.base';
import { BillingServiceItem } from './billing-service-item';

@Component({
  selector: 'mcs-billing-service-widget',
  templateUrl: './billing-service-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingServiceWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public billingAccountId: string;

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;
  public billingServices: BillingServiceItem[] = [];

  public fcBillingService: FormControl;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();
  private _billingServiceTooltipMap = new Map<number, BillingServiceItem>();

  private _billingAccountId: string = undefined;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _apiService: McsApiService,
    private _datePipe: StdDateFormatPipe,
    private _currencyPipe: StdCurrencyFormatPipe
  ) {
    super();
    this._registerFormControl();
    this._subscribeToBillingServiceControlChanges();

    this.chartConfig = {
      type: 'bar',
      stacked: true,
      yaxis: {
        title: 'Your Bill',
        showLabel: true,
        valueFormatter: this._valueYFormatter.bind(this)
      },
      tooltip: {
        customFormatter: this._tooltipCustomFormatter.bind(this)
      },
      dataLabels: {
        enabled: true,
        formatter: this._dataLabelFormatter.bind(this),
        offsetX: -25
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      }
    };
  }

  public ngOnInit() {
    this._subscribeToChartItemsChange();
    this.getBillingSummaries();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingAccountIdChange = changes['billingAccountId'];
    if (!isNullOrEmpty(billingAccountIdChange)) { this.getBillingSummaries(); }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getBillingSummaries(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    let apiQuery = new McsReportBillingSummaryParams();
    apiQuery.billingAccountId = this._billingAccountId;

    this._apiService.getBillingSummaries(apiQuery).pipe(
      map(billingSummaries => {
        if (isNullOrEmpty(billingSummaries)) { return []; }

        let flatRecords = this._getFlatBillingServices(billingSummaries?.collection);
        this.billingServices = flatRecords;
        return this._convertFlatRecordsToChartItems(flatRecords);
      }),
      tap(chartItems => {
        if (chartItems?.length === 0) { this.updateChartUri(''); }

        this._chartItemsChange.next(chartItems);
        this.processing = false;
        this._changeDetectorRef.markForCheck();
      }),
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this.updateChartUri('');
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe();
  }

  private _dataLabelFormatter(value: number, opts?: any): string {
    return this._currencyPipe.transform(value);
  }

  private _valueYFormatter(value: number): string {
    return  this._currencyPipe.transform(value);
  }

  private _generateServiceTitle(serviceItem: BillingServiceItem): string {
    if (isNullOrEmpty(serviceItem)) { return; }

    let serviceTitle = isNullOrEmpty(serviceItem.productType) ?
      serviceItem.service : `${serviceItem.productType} - ${serviceItem.service}`;

    let serviceTitleWithSuffix = serviceItem.isProjection ?
      `${serviceTitle} (projected)` : serviceTitle;
    return serviceTitleWithSuffix;
  }

  private _tooltipCustomFormatter(opts?: any): string {
    let serviceFound = this._billingServiceTooltipMap.get(opts.seriesIndex);
    if (isNullOrEmpty(serviceFound)) { return null; }

    let serviceTitle = this._generateServiceTitle(serviceFound);
    return this.generateCustomHtmlTooltip(serviceTitle, [
      new McsOption(
        this._currencyPipe.transform(serviceFound.finalChargeDollars),
        this._translate.instant('label.total')
      ),
      new McsOption(
        this._translate.instant('label.percentage', { value: serviceFound.discountPercent | 0 }),
        this._translate.instant('label.discountOfRrp')
      ),
      new McsOption(
        serviceFound.linkManagementService,
        this._translate.instant('label.linkManagementService')
      ),
      new McsOption(
        this._currencyPipe.transform(serviceFound.minimumCommitmentDollars),
        this._translate.instant('label.minimumSpendCommitment')
      ),
      new McsOption(
        this._translate.instant('message.markupPercent', { markup: serviceFound.markupPercent | 0 }),
        this._translate.instant('label.managementCharges')
      ),
      new McsOption(
        serviceFound.tenantName,
        this._translate.instant('label.tenantName')
      ),
      new McsOption(
        serviceFound.initialDomain,
        this._translate.instant('label.initialDomain')
      ),
      new McsOption(
        serviceFound.primaryDomain,
        this._translate.instant('label.primaryDomain')
      ),
      new McsOption(
        serviceFound.microsoftIdentifier,
        this._translate.instant('label.microsoftIdentifier')
      ),
      new McsOption(
        serviceFound.microsoftChargeMonth,
        this._translate.instant('label.microsoftChargeMonth')
      ),
      new McsOption(
        serviceFound.macquarieBillMonth,
        this._translate.instant('label.macquarieBillMonth')
      )
    ],
      !serviceFound.hasMetMinimumCommitment &&
      this._translate.instant('message.minimumSpendCommitmentNotMet')
    );
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _convertFlatRecordsToChartItems(services: BillingServiceItem[]): ChartItem[] {
    if (isNullOrEmpty(services)) { return []; }

    let chartItems = new Array<ChartItem>();
    services.forEach(billingService => {
      if (isNullOrEmpty(billingService)) { return; }

      chartItems.push({
        name: billingService.service,
        xValue: billingService.microsoftChargeMonth,
        yValue: billingService.childService?.finalChargeDollars ||
          billingService.parentService?.finalChargeDollars
      } as ChartItem);
    });
    return chartItems;
  }

  private _getFlatBillingServices(billingGroups: McsReportBillingServiceGroup[]): BillingServiceItem[] {
    if (isNullOrEmpty(billingGroups)) { return null; }

    let billingServiceItems = new Array<BillingServiceItem>();

    billingGroups.forEach(billingGroup => {
      billingGroup.parentServices?.forEach(parentService => {
        // Append Parent Service
        billingServiceItems.push(new BillingServiceItem(
          parentService.serviceId,
          this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
          this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
          getDateOnly(billingGroup.microsoftChargeMonth),
          parentService
        ));

        // Append Child Services Data
        parentService.childBillingServices?.forEach(childService => {
          billingServiceItems.push(new BillingServiceItem(
            childService.serviceId,
            this._datePipe.transform(getDateOnly(billingGroup.microsoftChargeMonth), 'shortMonthYear'),
            this._datePipe.transform(getDateOnly(billingGroup.macquarieBillMonth), 'shortMonthYear'),
            getDateOnly(billingGroup.microsoftChargeMonth),
            parentService,
            childService
          ));
        });
      });
    });

    // Sort all billing services by month
    billingServiceItems?.sort((first, second) => {
      return compareDates(first.sortDate, second.sortDate);
    });

    // Populate billing services series index
    let seriesIndex = 0;
    billingServiceItems?.forEach(billingService => {
      this._billingServiceTooltipMap.set(seriesIndex++, billingService);
    });

    return billingServiceItems;
  }

  private _registerFormControl(): void {
    this.fcBillingService = new FormControl('', []);
  }

  private _subscribeToBillingServiceControlChanges(): void {
    this.fcBillingService.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {
      this._onBillingServiceChange(change);
    });
  }

  private _onBillingServiceChange(services: BillingServiceItem[]): void {
    let serviceChartItems = this._convertFlatRecordsToChartItems(services);
    this._chartItemsChange.next(serviceChartItems);
  }
}
