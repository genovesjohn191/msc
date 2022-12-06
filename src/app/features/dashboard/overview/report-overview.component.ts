import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { DashboardExportDocumentManager } from '@app/features-shared/export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';
import { OverviewDocumentDetails } from '@app/features-shared/export-document-factory/models/report-overview';
import {
  McsContactUs,
  McsFeatureFlag,
  McsReportRecentServiceRequestSlt,
  McsReportCostRecommendations,
  McsReportPlatformSecurityAdvisories,
  McsReportTopVmsByCost,
  McsTicket,
  RouteKey,
  McsPlannedWork
} from '@app/models';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-report-overview',
  templateUrl: './report-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-overview-wrapper'
  }
})

export class ReportOverviewComponent {
  private _exportDocumentDetails = new OverviewDocumentDetails();
  private _isPdfDownloadInProgress: boolean;

  public constructor(
    private _injector: Injector,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService
  )
  {
    this._registerEvents();
  }

  public get arrowDropDownBlackIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_DROP_DOWN_BLACK;
  }

  public get hasPrivateAndPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud &&
      this._authenticationIdentity.platformSettings.hasPrivateCloud;
  }

  public get hasAccessToPrivateCloudDashboard(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.PrivateCloudDashboard]);
  }

  public get pdfDownloadInProgress(): boolean {
    return this._isPdfDownloadInProgress;
  }

  public get hasAccessToPlatformSecurity(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.PlatformSecurityAdvisory]);
  }

  public get hasAccessToRecentServiceRequestSlt(): boolean {
    let hasOrderAccess = this._accessControlService.hasPermission(['OrderEdit', 'OrderView']);
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.AzureServiceRequestSltReport]) &&
      hasOrderAccess;
  }

  public onClickPublicCloud(): void {
    this._navigationService.navigateTo(RouteKey.ReportOverview);
  }

  public onClickPrivateCloud(): void {
    this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
  }

  public onClickExportWord(): void {
    DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordOverview)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.MsWordOverview, this._injector)
  }

  public onClickExportPdf(): void {
    this._isPdfDownloadInProgress = true;
    this._changeDetector.markForCheck();
    setTimeout(() => {
      DashboardExportDocumentManager.initializeFactories()
        .getCreationFactory(DashboardExportDocumentType.MsWordOverview)
        .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.PdfOverview, this._injector)
    }, 100);
  }

  public azureSubscription(count: number): void {
    this._exportDocumentDetails.azureSubscription = count;
  }

  public licenseSubscription(count: number): void {
    this._exportDocumentDetails.licenseSubscription = count;
  }

  public azureResourceUri(uri: string): void {
    this._exportDocumentDetails.azureResources = uri;
  }

  public contactUs(contactUs: McsContactUs[]): void {
    this._exportDocumentDetails.contactUs = contactUs;
  }

  public costRecommendations(cost: McsReportCostRecommendations): void {
    this._exportDocumentDetails.costRecommendation = cost;
  }

  public resourceCountUri(uri: string): void {
    this._exportDocumentDetails.resourceCount = uri;
  }

  public azureTickets(data: McsTicket[]): void {
    this._exportDocumentDetails.azureTickets = data;
  }

  public topVmsByCost(data: McsReportTopVmsByCost[]): void {
    this._exportDocumentDetails.topVms = data;
  }

  public platformSecurityDataChange(data: McsReportPlatformSecurityAdvisories[]): void {
    this._exportDocumentDetails.platformSecurity = data;
  }

  public recentServiceRequestSltDataChange(data: McsReportRecentServiceRequestSlt[]): void {
    this._exportDocumentDetails.recentServiceRequestSlt = data;
  }
  
  public plannedWorkDataChange(plannedWorks: McsPlannedWork[]): void {
    this._exportDocumentDetails.plannedWorks = plannedWorks;
  }

  public widgetsLoading(): boolean {
    let platformSecurity = this.hasAccessToPlatformSecurity ? this._exportDocumentDetails.platformSecurity : [];
    let recentServiceRequest = this.hasAccessToRecentServiceRequestSlt ?
      this._exportDocumentDetails.recentServiceRequestSlt : [];

    return this._exportDocumentDetails.azureSubscription === undefined ||
      this._exportDocumentDetails.licenseSubscription === undefined ||
      this._exportDocumentDetails.azureResources === undefined ||
      this._exportDocumentDetails.contactUs === undefined ||
      this._exportDocumentDetails.costRecommendation === undefined ||
      this._exportDocumentDetails.resourceCount === undefined ||
      this._exportDocumentDetails.azureTickets === undefined ||
      this._exportDocumentDetails.topVms === undefined ||
      platformSecurity === undefined ||
      recentServiceRequest === undefined ||
      this._exportDocumentDetails.plannedWorks === undefined;
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.pdfDownloadEvent, this._pdfDownloadCompleted.bind(this));
  }

  private _pdfDownloadCompleted(): void {
    this._isPdfDownloadInProgress = false;
    this._changeDetector.markForCheck();
  }
}
