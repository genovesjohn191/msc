import {
  McsContactUs,
  McsReportCostRecommendations,
  McsReportTopVmsByCost,
  McsTicket
} from '@app/models';

export class OverviewDocumentDetails {
  public azureSubscription: number;
  public licenseSubscription: number;
  public azureResources: string;
  public resourceCount: string;
  public costRecommendation: McsReportCostRecommendations;
  public contactUs: McsContactUs[];
  public azureTickets: McsTicket[];
  public topVms: McsReportTopVmsByCost[];
}