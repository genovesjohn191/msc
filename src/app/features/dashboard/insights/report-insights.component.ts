import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { PerformanceAndScalabilityWidgetConfig, ReportPeriod } from '@app/features-shared/report-widget';
import { ResourceMonthlyCostWidgetConfig } from '@app/features-shared/report-widget/resource-monthly-cost/resource-monthly-cost-widget.component';
import { McsReportSubscription } from '@app/models';
import { ChartItem } from '@app/shared';
import { CommonDefinition, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface PeriodOption {
  label: string;
  period: ReportPeriod;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

@Component({
  selector: 'mcs-report-insights',
  templateUrl: './report-insights.component.html',
  styleUrls: ['../report-pages.scss', './report-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-insights-component'
  }
})
export class ReportInsightsComponent implements OnDestroy {
  public monthOptions: PeriodOption[];

  public get cloudHealthUrl(): string  {
    return CommonDefinition.CLOUD_HEALTH_URL;
  }

  public get azureSecurityUrl(): string  {
    return CommonDefinition.AZURE_SECURITY_URL;
  }

  public set selectedResourceCostMonth(value: PeriodOption) {
    this._selectedResourceCostMonth = value;
    this.resourceMonthlyCostConfig = {
      period: this._selectedResourceCostMonth.period.from
    };

    this._changeDetector.markForCheck();
  }

  public get selectedResourceCostMonth(): PeriodOption {
    return this._selectedResourceCostMonth;
  }

  public set subscriptionIdsFilter(value: string[]) {
    this._subscriptionFilterChange.next(value);
  }

  public get subscriptionIdsFilter(): string[] {
    return this._subscriptionIdsFilter;
  }

  public set performanceSubscriptionIdsFilter(value: string) {
    this._performanceSubscriptionFilterChange.next(value);
  }

  public get performanceSubscriptionIdsFilter(): string {
    return this._performanceSubscriptionIdsFilter;
  }

  public _subscriptionIdsFilter: string[] = undefined;
  public _performanceSubscriptionIdsFilter: string = '';

  public serviceCostConfig: PerformanceAndScalabilityWidgetConfig;
  public resourceMonthlyCostConfig: ResourceMonthlyCostWidgetConfig;

  public subscriptions: McsReportSubscription[];
  public performanceSubscriptions: McsReportSubscription[] = [{id: '', name: 'All'}];
  private _subscriptionFilterChange = new BehaviorSubject<string[]>([]);
  private _performanceSubscriptionFilterChange = new BehaviorSubject<string>('');
  private _selectedResourceCostMonth: PeriodOption;
  private _subscriptionSubject = new Subject();

  public constructor(private reportService: McsReportingService, private _changeDetector: ChangeDetectorRef) {
    this._getSubscriptions();
    this._createMonthOptions();
    this._listenToSubscriptionFilterChange();
    this._listenToPerformanceSubscriptionFilterChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._subscriptionSubject);
  }

  private _getSubscriptions(): void {
    this.reportService.getSubscriptions()
    .pipe(
      takeUntil(this._subscriptionSubject))
    .subscribe((data) => {
      this.subscriptions = data;
      this.performanceSubscriptions.push(...data);
      this.performanceSubscriptionIdsFilter =  this.performanceSubscriptions[0].id;
      this._changeDetector.markForCheck();
    });
  }

  private _listenToSubscriptionFilterChange(): void {
    this._subscriptionFilterChange
    .pipe(
      debounceTime(2000),
      distinctUntilChanged((arr1: string[], arr2: string[]) =>
        JSON.stringify(arr1) === JSON.stringify(arr2)))
    .subscribe((subscriptionIds) => {
      this._subscriptionIdsFilter = subscriptionIds;
      this._changeDetector.markForCheck();
    });
  }

  private _listenToPerformanceSubscriptionFilterChange(): void {
    this._performanceSubscriptionFilterChange
    .pipe(
      debounceTime(2000),
      distinctUntilChanged((val1: string, va2: string) =>
        JSON.stringify(val1) === JSON.stringify(va2)))
    .subscribe((performanceSubscriptionIds) => {
      this._performanceSubscriptionIdsFilter = performanceSubscriptionIds;
      this._changeDetector.markForCheck();
    });
  }

  private _createMonthOptions(): void {
    this.monthOptions = Array<PeriodOption>();
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    for (let ctr = 0; ctr < 12; ctr++) {
      let from = new Date(new Date().setMonth(currentDate.getMonth() - ctr));
      let label = months[from.getMonth()];
      if (currentYear !== from.getFullYear()) {
        label += ` ${from.getFullYear()}`;
      }
      let period = { from, until: from };

      this.monthOptions.push({label, period});
    }

    this.selectedResourceCostMonth = this.monthOptions[0];
  }

  public resourceMonthDataReceived(chartData: ChartItem[]) {
    if (!isNullOrEmpty(chartData)) {
      return;
    }
    let indexOfSelectedMonth = this.monthOptions.findIndex((options) => options.label === this.selectedResourceCostMonth.label);
    let lastIndexReached = indexOfSelectedMonth === this.monthOptions.length - 1;
    if (!lastIndexReached) {
      this.selectedResourceCostMonth = this.monthOptions[indexOfSelectedMonth + 1];
    }
  }

  public scrollToElement(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }
}
