import { JsonProperty } from '@app/utilities';

export class McsReportVMRightsizingSummary {
  @JsonProperty()
  public recommendationSavings: number = undefined;
}