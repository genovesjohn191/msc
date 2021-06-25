import { Injector } from '@angular/core';
import { InsightsDocumentDetails } from '../insights/report-insights-document';
import { OverviewDocumentDetails } from '../overview/report-overview.document';

type ReportingDetails = OverviewDocumentDetails | InsightsDocumentDetails;

export interface IDashboardExportDocument {
  exportDocument(itemDetails: ReportingDetails, docType: number, injector: Injector): void;
}
