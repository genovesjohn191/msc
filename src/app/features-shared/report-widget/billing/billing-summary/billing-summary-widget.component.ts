import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import { DecimalPipe } from '@angular/common';
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
import { McsReportBillingServiceGroup } from '@app/models';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe
} from '@app/shared';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';

import { ReportWidgetBase } from '../../report-widget.base';
import { IBillingOperation } from '../factory/abstractions/billing-operation.interface';
import { BillingOperationService } from '../factory/billing-operation.service';
import { BillingSummaryItem } from '../factory/models/billing-summary-item';

@Component({
  selector: 'mcs-billing-summary-widget',
  templateUrl: './billing-summary-widget.component.html',
  styleUrls: ['../../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingSummaryWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public billingSummaries: McsReportBillingServiceGroup[];

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _summaryOperation: IBillingOperation<McsReportBillingServiceGroup, BillingSummaryItem>;
  private _billingSummariesChange = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _decimalPipe: DecimalPipe,
    private _currencyPipe: StdCurrencyFormatPipe,
    private _billingOperationService: BillingOperationService
  ) {
    super();

    this.chartConfig = {
      type: 'bar',
      height: '420px',
      stacked: true,
      xaxis: {
        type: 'category'
      },
      yaxis: {
        title: 'Charge',
        showLabel: true,
        valueFormatter: this._valueYFormatter.bind(this)
      },
      tooltip: {
        customFormatter: this._tooltipCustomFormatter.bind(this),
        theme: 'dark'
      },
      dataLabels: {
        enabled: true,
        formatter: this._dataLabelFormatter.bind(this),
        offsetX: -10
      },
      legend: {
        position: 'right',
        horizontalAlign: 'left'
      }
    };
  }

  public ngOnInit(): void {
    this._subscribeToChartItemsChange();
    this.getBillingSummaries();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingSummariesChange = changes['billingSummaries'];
    if (!isNullOrEmpty(billingSummariesChange)) { this.getBillingSummaries(); }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._billingSummariesChange);
  }

  public getBillingSummaries(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._billingSummariesChange.next();

    if (!isNullOrEmpty(this.billingSummaries)) {
      this._billingOperationService
        .initializeBillingServiceGroups(this.billingSummaries);

      this._summaryOperation = this._billingOperationService.summaryOperation;
      this._summaryOperation.operationDataChange().pipe(
        takeUntil(this._billingSummariesChange),
        tap(operationData => {
          if (isNullOrEmpty(operationData)) { return; }

          this._chartItemsChange.next(operationData.chartItems);
          this.chartConfig.colors = operationData.chartColors;
          if (operationData.chartItems?.length === 0) { this.updateChartUri(''); }
          this._changeDetectorRef.markForCheck();
        })
      ).subscribe();

      this.processing = isNullOrUndefined(this.billingSummaries);
    }
    this._changeDetectorRef.markForCheck();
  }

  private _dataLabelFormatter(value: number, opts?: any): string {
    let thousandValue = value / 1000;
    let actualValue = thousandValue > 1 ? thousandValue : value;
    let roundedValue = +this._decimalPipe.transform(actualValue, '1.0-0');

    let displayedValue = thousandValue > 1 ? `$${roundedValue}K` : `$${roundedValue}`;
    return displayedValue;
  }

  private _valueYFormatter(value: number): string {
    return this._currencyPipe.transform(value);
  }

  private _tooltipCustomFormatter(opts?: any): string {
    let operationData = this._summaryOperation.getOperationData();
    if (isNullOrEmpty(operationData)) { return; }

    let billingFound = operationData.seriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(billingFound)) { return null; }

    let billingViewModel = operationData.getViewModelFunc(billingFound);
    let billingTitle = operationData.getTitleFunc(billingViewModel);

    return this.generateCustomHtmlTooltip(
      billingTitle,
      billingViewModel.items
    );
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
