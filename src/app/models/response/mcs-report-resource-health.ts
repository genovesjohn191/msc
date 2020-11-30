import { JsonProperty } from '@app/utilities';
import { McsReportResourceHealthResources } from './mcs-report-resource-health-resources';

export class McsReportResourceHealth {
  @JsonProperty()
  public totalCount: number = undefined;

  @JsonProperty()
  public resources: McsReportResourceHealthResources[] = undefined;
}