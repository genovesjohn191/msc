import { JsonProperty } from '@app/utilities';

export class McsReportUpdateManagement {
  @JsonProperty()
  public subscription: string = undefined;

  @JsonProperty()
  public subscriptionServiceId: string = undefined;

  @JsonProperty()
  public targetComputer: string = undefined;

  @JsonProperty()
  public azureId: string = undefined;

  @JsonProperty()
  public resourceGroup: string = undefined;

  @JsonProperty()
  public osType: string = undefined;

  @JsonProperty()
  public lastStatus: managementLastStatus = undefined;

  @JsonProperty()
  public lastStartTime: string = undefined;

  @JsonProperty()
  public lastEndTime: string = undefined;

  @JsonProperty()
  public error: string = undefined;
}

export type managementLastStatus = 'Succeeded' | 'Failed';