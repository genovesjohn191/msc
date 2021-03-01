import { JsonProperty } from '@app/utilities';

export class McsReportAuditAlerts {
  @JsonProperty()
  public severity: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public operationName: string = undefined;

  @JsonProperty()
  public occurredOn: Date = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public resourceId: string = undefined;
}