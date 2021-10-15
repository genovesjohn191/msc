import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { McsAccessControlService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsContactUs,
  McsFeatureFlag,
  McsReportCostRecommendations,
  McsReportPlatformSecurityAdvisories,
  McsReportTopVmsByCost,
  McsTicket
} from '@app/models';
import { DashboardExportDocumentManager } from '../export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '../export-document-factory/dashboard-export-document-type';
import { OverviewDocumentDetails } from './report-overview.document';

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
    private _accessControlService: McsAccessControlService,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService)
  {
    this._registerEvents();
  }

  public get pdfDownloadInProgress(): boolean {
    return this._isPdfDownloadInProgress;
  }

  public get hasAccessToPlatformSecurity(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.PlatformSecurityAdvisory]);
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

  public widgetsLoading(): boolean {
    let platformSecurity = this.hasAccessToPlatformSecurity ? this._exportDocumentDetails.platformSecurity : [];
    return this._exportDocumentDetails.azureSubscription === undefined ||
      this._exportDocumentDetails.licenseSubscription === undefined ||
      this._exportDocumentDetails.azureResources === undefined ||
      this._exportDocumentDetails.contactUs === undefined ||
      this._exportDocumentDetails.costRecommendation === undefined ||
      this._exportDocumentDetails.resourceCount === undefined ||
      this._exportDocumentDetails.azureTickets === undefined ||
      this._exportDocumentDetails.topVms === undefined ||
      platformSecurity === undefined;
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
