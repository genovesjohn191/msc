import {
  McsContactUs,
  McsReportComputeResourceTotals,
  McsTicket,
  McsReportStorageResourceUtilisation
} from '@app/models';
export class PrivateCloudDashboardOverviewDocumentDetails {
  public servicesOverview: McsReportComputeResourceTotals;
  public contactUs: McsContactUs[];
  public resourceStorageUtilisation: McsReportStorageResourceUtilisation[];
  public tickets: McsTicket[];
}