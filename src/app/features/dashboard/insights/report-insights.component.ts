import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';
import { McsReportingService } from '@app/core';
import {
  PerformanceAndScalabilityWidgetConfig,
  ReportPeriod
} from '@app/features-shared/report-widget';
import { MonitoringAlertingWidgetConfig } from '@app/features-shared/report-widget/monitoring-and-alerting/monitoring-and-alerting-widget.component';
import { ResourceMonthlyCostWidgetConfig } from '@app/features-shared/report-widget/resource-monthly-cost/resource-monthly-cost-widget.component';
import { McsReportSubscription } from '@app/models';
import {
  MonitoringAlertingPeriod,
  monitoringAlertingPeriodText
} from '@app/models/enumerations/report-monitoring-alerting-period.enum';
import { ChartItem } from '@app/shared';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

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
  public monitoringAlertingPeriodOptions: PeriodOption[];

  public get monitoringAlertingPeriodEnum(): any {
    return MonitoringAlertingPeriod;
  }

  public get cloudHealthUrl(): string  {
    return CommonDefinition.CLOUD_HEALTH_URL;
  }

  public get complianceAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Policy/PolicyMenuBlade/Overview`;
  }

  public get resourceHealthAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Security/SecurityMenuBlade/5`;
  }

  public get monitoringAlertingAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/alertsV2`;
  }

  public get auditAlertsAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Monitoring/AlertsManagementSummaryBlade`;
  }

  public get azureVmRightsizingCloudHealthUrl(): string  {
    return `${CommonDefinition.CLOUD_HEALTH_URL}/reports/metrics/azure-vm-rightsizing/current`;
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

  public set selectedAuditAlertsMonth(value: PeriodOption) {
    this._selectedAuditAlertsMonth = value;
    this.auditAlertsConfig = {
      period: this._selectedAuditAlertsMonth.period.from
    };

    this._changeDetector.markForCheck();
  }

  public get selectedAuditAlertsMonth(): PeriodOption {
    return this._selectedAuditAlertsMonth;
  }

  public set selectedMonitoringAlertingPeriod(value: PeriodOption) {
    this._selectedMonitoringAlertingPeriod = value;
    this.monitoringAlertingConfig = {
      period: {
        from: this._selectedMonitoringAlertingPeriod.period.from,
        until: this._selectedMonitoringAlertingPeriod.period.until,
      }
    };
    this._changeDetector.markForCheck();
  }

  public get selectedMonitoringAlertingPeriod(): PeriodOption {
    return this._selectedMonitoringAlertingPeriod;
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
  public auditAlertsConfig: ResourceMonthlyCostWidgetConfig;
  public monitoringAlertingConfig: MonitoringAlertingWidgetConfig

  public subscriptions: McsReportSubscription[];
  public performanceSubscriptions: McsReportSubscription[] = [{id: '', name: 'All'}];

  public hasManagementService: boolean;

  private _subscriptionFilterChange = new BehaviorSubject<string[]>([]);
  private _performanceSubscriptionFilterChange = new BehaviorSubject<string>('');
  private _selectedResourceCostMonth: PeriodOption;
  private _selectedAuditAlertsMonth: PeriodOption;
  private _selectedMonitoringAlertingPeriod: PeriodOption;
  private _subscriptionSubject = new Subject();
  private _destroySubject = new Subject<void>();

  public constructor(
    private reportService: McsReportingService,
    private _changeDetector: ChangeDetectorRef
  ) {
    this._getSubscriptions();
    this._identifyNonEssentialManagementServiceExistence();
    this._createMonthOptions();
    this._createMonitoringAlertingPeriodOptions();
    this._listenToSubscriptionFilterChange();
    this._listenToPerformanceSubscriptionFilterChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._subscriptionSubject);
    unsubscribeSafely(this._destroySubject);
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

  private _identifyNonEssentialManagementServiceExistence(): void {
    this.reportService.getManagementServices(false)
    .pipe(
      takeUntil(this._destroySubject))
    .subscribe((service) => {
      this.hasManagementService = service.length > 0;
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
    this.selectedAuditAlertsMonth = this.monthOptions[0];
  }

  private _createMonitoringAlertingPeriodOptions(): void {
    this.monitoringAlertingPeriodOptions = Array<PeriodOption>();
    let monitoringAlertingPeriodRange = this._mapPeriodEnumToPeriodOptions(this.monitoringAlertingPeriodEnum, monitoringAlertingPeriodText);
    const periodLength = monitoringAlertingPeriodRange.length;
    for (let ctr = 0; ctr < periodLength; ctr++) {
      let label = monitoringAlertingPeriodRange[ctr];
      let period = this.setMonitoringAlertingPeriodRange(label);

      this.monitoringAlertingPeriodOptions.push({label, period});
    }
    this.selectedMonitoringAlertingPeriod = this.monitoringAlertingPeriodOptions[0];
  }

  private _mapPeriodEnumToPeriodOptions(period: MonitoringAlertingPeriod, enumText: any): string[] {
    let periodOptions = [];
    Object.values(period)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => periodOptions.push(enumText[objValue]));
    return periodOptions;
  }

  private setMonitoringAlertingPeriodRange(label: string): ReportPeriod {
    let currentDate = new Date();
    if (label === monitoringAlertingPeriodText[1]) {
      return {
        from: new Date(new Date().setMonth(currentDate.getMonth() - 1)),
        until: new Date(new Date())
      };
    } else if (label === monitoringAlertingPeriodText[2]) {
      return {
        from: new Date(new Date().setDate(currentDate.getDate() - 14)),
        until: new Date(new Date())
      };
    } else if (label === monitoringAlertingPeriodText[3]) {
      return {
        from: new Date(new Date().setDate(currentDate.getDate() - 7)),
        until: new Date(new Date())
      };
    } else if (label ===monitoringAlertingPeriodText[4]) {
      return {
        from:  new Date(new Date()),
        until:  new Date(new Date())
      };
    }
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
