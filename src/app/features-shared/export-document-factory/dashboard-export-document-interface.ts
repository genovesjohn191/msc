import { Injector } from '@angular/core';
import { PrivateCloudDashboardOverviewDocumentDetails } from './models/private-cloud-dashboard-overview';
import { InsightsDocumentDetails } from './models/report-insights';
import { OverviewDocumentDetails } from './models/report-overview';

type ReportingDetails = OverviewDocumentDetails |
  InsightsDocumentDetails |
  PrivateCloudDashboardOverviewDocumentDetails;

export interface IDashboardExportDocument {
  exportDocument(itemDetails: ReportingDetails, docType: number, injector: Injector): void;
}
