import { JsonProperty } from '@app/utilities';

export class McsCloudHealthAlertConfigurationItems {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public subscriptionName: string = undefined;

  @JsonProperty()
  public resourceGroupName: string = undefined;

  @JsonProperty()
  public sizeGB: number = undefined;

  @JsonProperty()
  public ipAddress: string = undefined;
}