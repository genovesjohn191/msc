import { Injector } from '@angular/core';
import { InsightsDocumentDetails } from '@app/features/dashboard/insights/report-insights-document';
import { OverviewDocumentDetails } from '@app/features/dashboard/overview/report-overview.document';
import { PrivateCloudDashboardOverviewDocumentDetails } from '@app/features/private-cloud-dashboard/overview/private-cloud-dashboard-overview';

type ReportingDetails = OverviewDocumentDetails |
  InsightsDocumentDetails |
  PrivateCloudDashboardOverviewDocumentDetails;

export interface IDashboardExportDocument {
  exportDocument(itemDetails: ReportingDetails, docType: number, injector: Injector): void;
}
