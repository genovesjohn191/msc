import {
  McsContactUs,
  McsReportComputeResourceTotals
} from '@app/models';

export class PrivateCloudDashboardOverviewDocumentDetails {
  public servicesOverview: McsReportComputeResourceTotals;
  public contactUs: McsContactUs[];
}