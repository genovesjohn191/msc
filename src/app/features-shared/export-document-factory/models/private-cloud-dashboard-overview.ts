import {
  McsContactUs,
  McsReportComputeResourceTotals,
  McsTicket,
  McsReportStorageResourceUtilisation,
  McsPlannedWork
} from '@app/models';
export class PrivateCloudDashboardOverviewDocumentDetails {
  public servicesOverview: McsReportComputeResourceTotals;
  public contactUs: McsContactUs[];
  public resourceStorageUtilisation: McsReportStorageResourceUtilisation[];
  public tickets: McsTicket[];
  public plannedWorks: McsPlannedWork[];
}