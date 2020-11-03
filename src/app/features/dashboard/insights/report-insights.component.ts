import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { PerformanceAndScalabilityWidgetConfig, ReportPeriod } from '@app/features-shared/report-widget';
import { McsReportSubscription } from '@app/models';
import { unsubscribeSafely } from '@app/utilities';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

  public set selectedPerformanceMonth(value: PeriodOption) {
    this._selectedPerformanceMonth = value;
    this.serviceCostConfig = {
      period: this._selectedPerformanceMonth.period.from,
      subscriptionIds: this.subscriptionIdsFilter
    };

    this._changeDetector.markForCheck();
  }

  public get selectedPerformanceMonth(): PeriodOption {
    return this._selectedPerformanceMonth;
  }

  public set subscriptionIdsFilter(value: string[]) {
    this._subscriptionFilterChange.next(value);
  }

  public get subscriptionIdsFilter(): string[] {
    return this._subscriptionIdsFilter;
  }
  public _subscriptionIdsFilter: string[] = undefined;

  public serviceCostConfig: PerformanceAndScalabilityWidgetConfig;

  public subscriptions: McsReportSubscription[];
  private _subscriptionFilterChange = new BehaviorSubject<string[]>([]);
  private _selectedPerformanceMonth: PeriodOption;
  private _subscriptionSubject = new Subject();

  public constructor(private reportService: McsReportingService, private _changeDetector: ChangeDetectorRef) {
    this._getSubscriptions();
    this._createMonthOptions();
    this._listenToSubscriptionFilterChange();
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

    this.selectedPerformanceMonth = this.monthOptions[0];
  }
}
