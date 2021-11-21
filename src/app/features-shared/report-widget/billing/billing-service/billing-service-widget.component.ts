import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  debounceTime,
  map,
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
import { FormControl } from '@angular/forms';
import {
  McsOption,
  McsOptionGroup,
  McsReportBillingServiceGroup
} from '@app/models';
import {
  ChartConfig,
  ChartItem,
  StdCurrencyFormatPipe
} from '@app/shared';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  removeSpaces,
  unsubscribeSafely,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ReportWidgetBase } from '../../report-widget.base';
import { IBillingOperation } from '../factory/abstractions/billing-operation.interface';
import { BillingOperationService } from '../factory/billing-operation.service';
import { BillingServiceItem } from '../factory/models/billing-service-item';

@Component({
  selector: 'mcs-billing-service-widget',
  templateUrl: './billing-service-widget.component.html',
  styleUrls: ['../../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class BillingServiceWidgetComponent extends ReportWidgetBase implements OnInit, OnChanges, OnDestroy {
  @Input()
  public billingSummaries: McsReportBillingServiceGroup[];

  public servicesDatasource: TreeDatasource<McsReportBillingServiceGroup>;

  public chartConfig: ChartConfig;
  public chartItems$: Observable<ChartItem[]>;

  public hasError: boolean = false;
  public processing: boolean = true;
  public fcBillingService = new FormControl('', []);

  private _chartItemsChange = new BehaviorSubject<ChartItem[]>(null);
  private _destroySubject = new Subject<void>();

  private _billingServiceGroupsChange = new BehaviorSubject<McsOptionGroup[]>(null);

  private _serviceOperation: IBillingOperation<McsReportBillingServiceGroup, BillingServiceItem>;
  private _billingSummariesChange = new Subject<void>();

  private _initialized = false;
  private _hasBeenFiltered = false;
  private _totalServicesCount = 0;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _decimalPipe: DecimalPipe,
    private _currencyPipe: StdCurrencyFormatPipe,
    private _billingOperationService: BillingOperationService
  ) {
    super();
    this.servicesDatasource = new TreeDatasource(this._convertGroupServicesToTreeItems.bind(this));

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
    this.displayAllBillingServices();
    this._subscribeToBillingServiceControlChanges();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let billingSummariesChange = changes['billingSummaries'];
    if (!isNullOrEmpty(billingSummariesChange)) {
      this.displayAllBillingServices();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._billingSummariesChange);

    if (this._hasBeenFiltered) {
      this._serviceOperation?.reset();
    }
  }

  public displayAllBillingServices(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._billingSummariesChange.next();

    if (!isNullOrEmpty(this.billingSummaries)) {
      this._billingOperationService
        .initializeBillingServiceGroups(this.billingSummaries);

      this._serviceOperation = this._billingOperationService.serviceOperation;
      this._serviceOperation.operationDataChange().pipe(
        takeUntil(this._billingSummariesChange),
        tap(operationData => {
          if (isNullOrEmpty(operationData)) { return; }

          if (!this._initialized) this._updateGroupBillingServices();

          this._chartItemsChange.next(operationData.chartItems);
          this.chartConfig.colors = operationData.chartColors;
          if (operationData.chartItems?.length === 0) { this.updateChartUri(''); }
          this._initialized = true;
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
    let operationData = this._serviceOperation.getOperationData();
    if (isNullOrEmpty(operationData)) { return; }

    let billingFound = operationData.seriesItems[opts.seriesIndex][opts.dataPointIndex];
    if (isNullOrEmpty(billingFound)) { return null; }

    let billingViewModel = operationData.getViewModelFunc(billingFound);
    let billingTitle = operationData.getTitleFunc(billingViewModel);

    return this.generateCustomHtmlTooltip(
      billingTitle,
      billingViewModel.items,
      billingViewModel.includeMininumCommentNote &&
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

  private _convertGroupServicesToTreeItems(): Observable<TreeItem<string>[]> {
    return this._billingServiceGroupsChange.pipe(
      map(groups =>
        TreeUtility.convertEntityToTreemItems(groups,
          group => new TreeGroup(group.groupName, group.groupName, group.options, {
            selectable: true,
            excludeFromSelection: true
          }),
          option => new TreeGroup(option.text, option.value, null, {
            selectable: true
          })
        )
      )
    );
  }

  private _updateGroupBillingServices(): void {
    this._totalServicesCount = 0;
    let operationData = this._serviceOperation.getOperationData();
    if (isNullOrEmpty(operationData?.summaryItems)) { return null; }

    let groupRecords = new Array<McsOptionGroup>();
    let groupRecordsMap = new Map<string, McsOption[]>();

    // Group records by product type
    operationData.summaryItems?.forEach(flatRecord => {
      let groupRawName = flatRecord?.productType;
      let groupItemsFound = groupRecordsMap.get(groupRawName);
      let options = !isNullOrEmpty(groupItemsFound) ?
        groupItemsFound : new Array<McsOption>();

      let billingViewModel = operationData.getViewModelFunc(flatRecord);
      let billingTitle = operationData.getTitleFunc(billingViewModel);

      options.push(new McsOption(flatRecord, billingTitle));
      groupRecordsMap.set(groupRawName, options);
    });

    // Update mapping
    groupRecordsMap.forEach((options, productType) => {
      let billingKey = removeSpaces(productType)?.toUpperCase();
      let groupRecordName = operationData.getNameFunc(billingKey);
      let uniqueRecords = options.distinct(item => item.text);
      this._totalServicesCount += uniqueRecords?.length;
      groupRecords.push(new McsOptionGroup(groupRecordName || productType, ...uniqueRecords));
    });

    this._billingServiceGroupsChange.next(groupRecords);
  }

  private _subscribeToBillingServiceControlChanges(): void {
    this.fcBillingService.valueChanges.pipe(
      takeUntil(this._destroySubject),
      debounceTime(500)
    ).subscribe(selectedServices => {

      if (!this._initialized) { return; }
      this._filterBillingServices(selectedServices);
    });
  }

  private _filterBillingServices(distinctServices: BillingServiceItem[]): void {
    this._serviceOperation.filterOperationData(item =>
      isNullOrEmpty(distinctServices) ||
      !!distinctServices.find(distinctService => distinctService.serviceId === item.serviceId)
    );
    this._hasBeenFiltered = distinctServices?.length !== this._totalServicesCount;
    this._changeDetectorRef.markForCheck();
  }
}
