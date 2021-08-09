import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsContactUs,
  McsReportCostRecommendations,
  McsReportTopVmsByCost,
  McsTicket
} from '@app/models';
import { DashboardExportDocumentManager } from '../export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '../export-document-factory/dashboard-export-document-type';
import { OverviewDocumentDetails } from './report-overview.document';

@Component({
  selector: 'mcs-report-overview',
  templateUrl: './report-overview.component.html',
  styleUrls: ['../report-pages.scss', './report-overview.component.scss'],
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
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService)
  {
    this._registerEvents();
  }

  public get pdfDownloadInProgress(): boolean {
    return this._isPdfDownloadInProgress;
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

  public widgetsLoading(): boolean {
    return this._exportDocumentDetails.azureSubscription === undefined ||
      this._exportDocumentDetails.licenseSubscription === undefined ||
      this._exportDocumentDetails.azureResources === undefined ||
      this._exportDocumentDetails.contactUs === undefined ||
      this._exportDocumentDetails.costRecommendation === undefined ||
      this._exportDocumentDetails.resourceCount === undefined ||
      this._exportDocumentDetails.azureTickets === undefined ||
      this._exportDocumentDetails.topVms === undefined;
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
