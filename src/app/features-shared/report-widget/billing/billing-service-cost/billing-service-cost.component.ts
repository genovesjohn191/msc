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
  Injector,
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
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../../report-widget.base';
import { IBillingOperation } from '../factory/abstractions/billing-operation.interface';
import { BillingOperationFactory } from '../factory/billing-operation.factory';
import {
  BillingOperationType,
  BillingServiceItem
} from '../factory/models';

@Component({
  selector: 'mcs-billing-service-cost-widget',
  templateUrl: './billing-service-cost.component.html',
  styleUrls: ['../../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingServiceCostWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public dataProcess: DataProcess<any>;

  @Input()
  public dataRecords: McsReportBillingServiceGroup[];

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _serviceOperation: IBillingOperation<McsReportBillingServiceGroup, BillingServiceItem>;
  private _serviceDestroyer = new Subject<void>();

  public constructor(
    private _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _decimalPipe: DecimalPipe,
    private _currencyPipe: StdCurrencyFormatPipe
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

  public ngOnInit() {
    this._subscribeToChartItemsChange();
    this.initializeDataRecords();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let servicesChange = changes['services'];
    if (!isNullOrEmpty(servicesChange)) {
      this.initializeDataRecords();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._serviceDestroyer);
    this._serviceOperation?.reset();
  }

  public initializeDataRecords(): void {
    this.updateChartUri(undefined);
    if (isNullOrEmpty(this.dataRecords)) { return; }
    this._serviceDestroyer.next();

    this._serviceOperation = BillingOperationFactory
      .getInstance(this._injector)
      .createServiceGroupFactory(BillingOperationType.ServiceCost, this.dataRecords);

    this._serviceOperation.operationDataChange().pipe(
      takeUntil(this._serviceDestroyer),
      tap(operationData => {
        if (isNullOrEmpty(operationData)) { return; }

        this._chartItemsChange.next(operationData.chartItems);
        this.chartConfig.colors = operationData.chartColors;
        if (operationData.chartItems?.length === 0) { this.updateChartUri(''); }
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
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
    let operationData = this._serviceOperation.getOperationData();
    if (isNullOrEmpty(operationData)) { return; }

    let billingFound = operationData.seriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(billingFound)) { return null; }

    let billingViewModel = operationData.getViewModelFunc(billingFound);
    let billingTitle = operationData.getTitleFunc(billingViewModel);

    return this.generateCustomHtmlTooltip(
      billingTitle,
      billingViewModel.items,
      billingViewModel.includeMinimumCommentNote &&
      !billingFound.hasMetMinimumCommitment &&
      billingFound.minimumCommitmentDollars &&
      this._translate.instant('message.minimumSpendCommitmentNotMet')
    );
  }

  private _subscribeToChartItemsChange(): void {
    this.chartItems$ = this._chartItemsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
