import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Injector
} from '@angular/core';
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
  PerformanceAndScalabilityWidgetConfig,
  ReportMonthConfig,
  ReportPeriod
} from '@app/features-shared/report-widget';
import { MonitoringAlertingWidgetConfig } from '@app/features-shared/report-widget/monitoring-and-alerting/monitoring-and-alerting-widget.component';
import {
  McsFeatureFlag,
  McsPermission,
  McsReportAscAlerts,
  McsReportAuditAlerts,
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
import { InsightsDocumentDetails } from './report-insights-document';
import { DashboardExportDocumentManager } from '../export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '../export-document-factory/dashboard-export-document-type';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

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
  styleUrls: ['./report-insights.component.scss'],
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

  public get ascAlertsAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Security/SecurityMenuBlade/7`;
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

  public set selectedAscAlertsMonth(value: PeriodOption) {
    this._selectedAscAlertsMonth = value;
    this.ascAlertsConfig = {
      period: this._selectedAscAlertsMonth.period.from
    };

    this._changeDetector.markForCheck();
  }

  public get selectedAscAlertsMonth(): PeriodOption {
    return this._selectedAscAlertsMonth;
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

  public get hasTicketPermission(): boolean {
    return this._accessControlService.hasPermission([McsPermission.TicketView]);
  }

  public get hasAccessToAscAlert(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.AscAlert]);
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public _subscriptionIdsFilter: string[] = undefined;
  public _performanceSubscriptionIdsFilter: string = '';

  public serviceCostConfig: PerformanceAndScalabilityWidgetConfig;
  public resourceMonthlyCostConfig: ReportMonthConfig;
  public auditAlertsConfig: ReportMonthConfig;
  public ascAlertsConfig: ReportMonthConfig;
  public monitoringAlertingConfig: MonitoringAlertingWidgetConfig

  public subscriptions: McsReportSubscription[];
  public performanceSubscriptions: McsReportSubscription[] = [{id: '', name: 'All'}];

  private _managementServices: McsReportManagementService[] = [];
  private _subscriptionFilterChange = new BehaviorSubject<string[]>([]);
  private _performanceSubscriptionFilterChange = new BehaviorSubject<string>('');
  private _selectedResourceCostMonth: PeriodOption;
  private _selectedAuditAlertsMonth: PeriodOption;
  private _selectedAscAlertsMonth: PeriodOption;
  private _selectedMonitoringAlertingPeriod: PeriodOption;
  private _subscriptionSubject = new Subject();
  private _destroySubject = new Subject<void>();
  private _exportDocumentDetails = new InsightsDocumentDetails();
  private _isPdfDownloadInProgress: boolean;

  public constructor(
    private _accessControlService: McsAccessControlService,
    private reportService: McsReportingService,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector
  ) {
    this._registerEvents();
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

  public ascAlertsDataChange(data: McsReportAscAlerts[]): void {
    this._exportDocumentDetails.ascAlerts = data;
  }

  public updateManagementDataChange(data: McsReportUpdateManagement[]): void {
    this._exportDocumentDetails.updateManagement = data;
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
    let ascAlert = this.hasAccessToAscAlert ? this._exportDocumentDetails.ascAlerts : [];
    return this._exportDocumentDetails.securityScore === undefined ||
      this._exportDocumentDetails.complianceUri === undefined ||
      this._exportDocumentDetails.resourceHealth === undefined ||
      this._exportDocumentDetails.performanceScalability === undefined ||
      this._exportDocumentDetails.monitoringAlerting === undefined ||
      this._exportDocumentDetails.auditAlerts === undefined ||
      this._exportDocumentDetails.updateManagement  === undefined ||
      ascAlert === undefined;
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
    this.selectedAscAlertsMonth = this.monthOptions[0];
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
    if (!this.noDataForOneYear) {
      this.selectedResourceCostMonth = this.monthOptions[this.indexOfSelectedMonth + 1];
    }
  }

  public scrollToElement(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }
}