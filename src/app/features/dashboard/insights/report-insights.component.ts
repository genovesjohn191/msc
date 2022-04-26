import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Injector
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';
import {
  McsAccessControlService,
  McsReportingService
} from '@app/core';
import {
  ReportMonthConfig,
  ReportPeriod
} from '@app/features-shared/report-widget';
import { MonitoringAlertingWidgetConfig } from '@app/features-shared/report-widget/monitoring-and-alerting/monitoring-and-alerting-widget.component';
import {
  McsFeatureFlag,
  McsReportAuditAlerts,
  McsReportDefenderCloudAlerts,
  McsReportInefficientVms,
  McsReportManagementService,
  McsReportOperationalSavings,
  McsReportResourceCompliance,
  McsReportSecurityScore,
  McsReportSubscription,
  McsReportUpdateManagement,
  McsReportVMRightsizing,
  RouteKey
} from '@app/models';
import { ChartItem } from '@app/shared';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { DashboardExportDocumentManager } from '@app/features-shared/export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';
import { InsightsDocumentDetails } from '@app/features-shared/export-document-factory/models/report-insights';

interface PeriodOption {
  label: string;
  period: ReportPeriod;
}

@Component({
  selector: 'mcs-report-insights',
  templateUrl: './report-insights.component.html',
  styleUrls: ['./report-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-insights-component'
  }
})
export class ReportInsightsComponent implements OnDestroy {
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

  public get noDataForOneYear(): boolean {
    return this.indexOfSelectedMonth === this.monthOptions.length - 1;
  }

  public get indexOfSelectedMonth(): number {
    return this.monthOptions.findIndex((options) => options.label === this.selectedResourceCostMonth.label);
  }

  public get hasManagementService(): boolean {
    return this._managementServices?.length > 0;
  }

  public get pdfDownloadInProgress(): boolean {
    return this._isPdfDownloadInProgress;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public fcResourceCostMonthPeriod: FormControl;
  public fcDefenderCloudAlertMonthPeriod: FormControl;
  public fcAuditAlertMonthPeriod: FormControl;
  public fcMonitoringPeriod: FormControl;

  public monthOptions: PeriodOption[];
  public _subscriptionIdsFilter: string[] = undefined;
  public _performanceSubscriptionIdsFilter: string = '';

  public resourceMonthlyCostConfig: ReportMonthConfig;
  public auditAlertsConfig: ReportMonthConfig;
  public defenderCloudAlertsConfig: ReportMonthConfig;
  public monitoringAlertingConfig: MonitoringAlertingWidgetConfig

  public selectedResourceCostMonth: PeriodOption;
  public selectedAuditAlertsMonth: PeriodOption;
  public selectedDefenderCloudAlertsMonth: PeriodOption;
  public selectedMonitoringAlertingPeriod: PeriodOption;

  public subscriptions: McsReportSubscription[];
  public performanceSubscriptions: McsReportSubscription[] = [{id: '', name: 'All'}];

  private _managementServices: McsReportManagementService[] = [];
  private _exportDocumentDetails = new InsightsDocumentDetails();
  private _isPdfDownloadInProgress: boolean;

  private _subscriptionFilterChange = new BehaviorSubject<string[]>([]);
  private _performanceSubscriptionFilterChange = new BehaviorSubject<string>('');
  private _subscriptionSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _destroyPeriodSubject = new Subject<void>();

  public constructor(
    private _accessControlService: McsAccessControlService,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector,
    private _reportService: McsReportingService
  ) {
    this._registerEvents();
    this._registerFormControl();
    this._getSubscriptions();
    this._identifyNonEssentialManagementServiceExistence();
    this._subscribeToResourceMonthPeriodControlChanges();
    this._subscribeToDefenderCloudAlertMonthPeriodControlChanges();
    this._subscribeToAuditMonthPeriodControlChanges();
    this._subscribeToMonitoringPeriodControlChanges();
    this._listenToSubscriptionFilterChange();
    this._listenToPerformanceSubscriptionFilterChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._subscriptionSubject);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._destroyPeriodSubject);
  }

  public onClickExportWord(): void {
    DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordInsights)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.MsWordInsights, this._injector)
  }

  public onClickExportPdf(): void {
    this._isPdfDownloadInProgress = true;
    this._changeDetector.markForCheck();
    setTimeout(() => {
      DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordInsights)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.PdfInsights, this._injector)
    }, 100);
  }

  public serviceCostUri(uri: string): void { this._exportDocumentDetails.serviceCost = uri; }

  public monthlyCostUri(uri: string): void {
    this._exportDocumentDetails.monthlyCostUri = uri;
    this._exportDocumentDetails.monthlyCostselectedMonth = this.selectedResourceCostMonth.label;
  }

  public vmBreakdownUri(uri: string): void {
    this._exportDocumentDetails.vmBreakdown = uri;
  }

  public operationalSavingsDataChange(data: McsReportOperationalSavings): void {
    this._exportDocumentDetails.operationalSavings = data;
  }

  public vmRightSizingDataChange(data: McsReportVMRightsizing[]): void {
    this._exportDocumentDetails.vmRightsizing = data;
  }

  public vmCostDataChange(cost: string): void {
    this._exportDocumentDetails.vmCost = cost;
  }

  public inefficientVmsDataChange(data: McsReportInefficientVms[]): void {
    this._exportDocumentDetails.inefficientVms = data;
  }

  public securityScoreDataChange(uri: McsReportSecurityScore): void {
    this._exportDocumentDetails.securityScore = uri;
  }

  public complianceDataChange(data: McsReportResourceCompliance): void {
    this._exportDocumentDetails.compliance = data;
  }

  public complianceChartUri(uri: string): void {
    this._exportDocumentDetails.complianceUri = uri;
  }

  public resourceHealthUri(uri: string): void {
    this._exportDocumentDetails.resourceHealth = uri;
  }

  public performanceScalabilityUri(uri: string): void {
    this._exportDocumentDetails.performanceScalability = uri;
  }

  public monitoringAlertingTotalAlertsDataChange(totalAlerts: number): void {
    this._exportDocumentDetails.totalAlerts = totalAlerts;
  }

  public monitoringAlertingUri(uri: string): void {
    this._exportDocumentDetails.monitoringAlerting = uri;
  }

  public auditAlertsDataChange(data: McsReportAuditAlerts[]): void {
    this._exportDocumentDetails.auditAlerts = data;
  }

  public defenderCLoudAlertsDataChange(data: McsReportDefenderCloudAlerts[]): void {
    this._exportDocumentDetails.defenderCloudAlerts = data;
  }

  public updateManagementDataChange(data: McsReportUpdateManagement[]): void {
    this._exportDocumentDetails.updateManagement = data;
  }

  public getPeriodOptions(options: PeriodOption[]): void {
    this.monthOptions = options;
  }

  public resourceMonthDataReceived(chartData: ChartItem[]) {
    if (!isNullOrEmpty(chartData)) {
      return;
    }
    if (!this.noDataForOneYear) {
      this.selectedResourceCostMonth = this.monthOptions[this.indexOfSelectedMonth + 1];
      this.fcResourceCostMonthPeriod.setValue(this.selectedResourceCostMonth);
    }
  }

  public scrollToElement(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  public widgetsLoading(): boolean {
    let isCostsWidgetsLoading = this._isCostsWidgetsLoading();
    let isTechReviewWidgetsLoading = this.hasManagementService ? this._isTechReviewWidgetsLoading() : false;
    return isCostsWidgetsLoading || isTechReviewWidgetsLoading;
  }

  private _isCostsWidgetsLoading(): boolean {
    return this._exportDocumentDetails.serviceCost === undefined ||
      this._exportDocumentDetails.monthlyCostUri === undefined ||
      this._exportDocumentDetails.vmBreakdown === undefined ||
      this._exportDocumentDetails.operationalSavings === undefined ||
      this._exportDocumentDetails.vmRightsizing === undefined ||
      this._exportDocumentDetails.inefficientVms === undefined;
  }

  private _isTechReviewWidgetsLoading(): boolean {
    return this._exportDocumentDetails.securityScore === undefined ||
      this._exportDocumentDetails.complianceUri === undefined ||
      this._exportDocumentDetails.resourceHealth === undefined ||
      this._exportDocumentDetails.performanceScalability === undefined ||
      this._exportDocumentDetails.monitoringAlerting === undefined ||
      this._exportDocumentDetails.auditAlerts === undefined ||
      this._exportDocumentDetails.updateManagement  === undefined ||
      this._exportDocumentDetails.defenderCloudAlerts === undefined;
  }

  private _registerFormControl(): void {
    this.fcResourceCostMonthPeriod = new FormControl('', []);
    this.fcDefenderCloudAlertMonthPeriod = new FormControl('', []);
    this.fcAuditAlertMonthPeriod = new FormControl('', []);
    this.fcMonitoringPeriod = new FormControl('', []);
  }

  private _subscribeToResourceMonthPeriodControlChanges(): void {
    this.fcResourceCostMonthPeriod.valueChanges.pipe(
      takeUntil(this._destroyPeriodSubject),
    ).subscribe(change => {
      this.selectedResourceCostMonth = change;
      this.resourceMonthlyCostConfig = {
        period: this.selectedResourceCostMonth.period.from
      };
      this._changeDetector.markForCheck();
    });
  }

  private _subscribeToDefenderCloudAlertMonthPeriodControlChanges(): void {
    this.fcDefenderCloudAlertMonthPeriod.valueChanges.pipe(
      takeUntil(this._destroyPeriodSubject),
    ).subscribe(change => {
      this.selectedDefenderCloudAlertsMonth = change;
      this.defenderCloudAlertsConfig = {
        period: this.selectedDefenderCloudAlertsMonth.period.from
      };
      this._changeDetector.markForCheck();
    });
  }

  private _subscribeToAuditMonthPeriodControlChanges(): void {
    this.fcAuditAlertMonthPeriod.valueChanges.pipe(
      takeUntil(this._destroyPeriodSubject),
    ).subscribe(change => {
      this.selectedAuditAlertsMonth = change;
      this.auditAlertsConfig = {
        period: this.selectedAuditAlertsMonth.period.from
      };
      this._changeDetector.markForCheck();
    });
  }

  private _subscribeToMonitoringPeriodControlChanges(): void {
    this.fcMonitoringPeriod.valueChanges.pipe(
      takeUntil(this._destroyPeriodSubject),
    ).subscribe(change => {
      this.selectedMonitoringAlertingPeriod = change;
      this.monitoringAlertingConfig = {
        period: {
          from: this.selectedMonitoringAlertingPeriod.period.from,
          until: this.selectedMonitoringAlertingPeriod.period.until,
        }
      };
      this._changeDetector.markForCheck();
    });
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.pdfDownloadEvent, this._pdfDownloadCompleted.bind(this));
  }

  private _pdfDownloadCompleted(): void {
    this._isPdfDownloadInProgress = false;
    this._changeDetector.markForCheck();
  }

  private _getSubscriptions(): void {
    this._reportService.getSubscriptions()
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
    this._reportService.getManagementServices(false)
    .pipe(
      takeUntil(this._destroySubject),
      catchError((error) => {
        this._exportDocumentDetails.hasManagementService = false;
        return throwError(error);
      })
    )
    .subscribe((services) => {
      this._managementServices = services;
      this._exportDocumentDetails.hasManagementService = services?.length > 0;
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
}