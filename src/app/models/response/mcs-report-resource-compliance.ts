import { ChartItem } from '@app/shared';
import { JsonProperty } from '@app/utilities';
import { McsReportResourceComplianceState } from './mcs-report-resource-compliance-state';

export class McsReportResourceCompliance {
  @JsonProperty()
  public resourceCompliancePercentage: number = undefined;

  @JsonProperty()
  public compliantResources: number = undefined;

  @JsonProperty()
  public totalResources: number = undefined;

  @JsonProperty()
  public resources: McsReportResourceComplianceState[] = undefined;

  @JsonProperty()
  public nonCompliantInitiatives: number = undefined;

  @JsonProperty()
  public totalInitiatives: number = undefined;

  @JsonProperty()
  public nonCompliantPolicies: number = undefined;

  @JsonProperty()
  public totalPolicies: number = undefined;

  @JsonProperty()
  public resourceChartItem: ChartItem[] = undefined;
}