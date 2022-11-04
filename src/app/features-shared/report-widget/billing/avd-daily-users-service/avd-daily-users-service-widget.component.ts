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
import { McsReportBillingAvdDailyUser } from '@app/models';
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  DataProcess
} from '@app/utilities';

import { ReportWidgetBase } from '../../report-widget.base';
import { IBillingOperation } from '../factory/abstractions/billing-operation.interface';
import { BillingOperationFactory } from '../factory/billing-operation.factory';
import { BillingOperationType } from '../factory/models';
import { BillingAvdDailyUserServiceItem } from '../factory/operations/billing-avd-daily-user-service.operation';

@Component({
  selector: 'mcs-avd-daily-users-service-widget',
  templateUrl: './avd-daily-users-service-widget.component.html',
  styleUrls: ['../../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class AvdDailyUsersServiceWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public dataProcess: DataProcess<any>;

  @Input()
  public dataRecords: McsReportBillingAvdDailyUser[];

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _serviceOperation: IBillingOperation<McsReportBillingAvdDailyUser, BillingAvdDailyUserServiceItem>;
  private _serviceDestroyer = new Subject<void>();

  public constructor(
    private _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef
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
        title: 'Users',
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
    let recordsChange = changes['dataRecords'];
    if (!isNullOrEmpty(recordsChange)) {
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
      .createServiceGroupFactory(BillingOperationType.DailyUserService, this.dataRecords);

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
    return value?.toFixed(0);
  }

  private _valueYFormatter(value: number): string {
    return value?.toFixed(0);
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
