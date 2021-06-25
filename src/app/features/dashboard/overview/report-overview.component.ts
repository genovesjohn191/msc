import {
  Component,
  ChangeDetectionStrategy,
  Injector,
} from '@angular/core';
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

  public constructor(private _injector: Injector) {}

  public onClickExportWord(): void {
    DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordOverview)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.MsWordOverview, this._injector)
  }

  public onClickExportPdf(): void {
    DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordOverview)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.PdfOverview, this._injector)
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
}
