import { JsonProperty } from '@app/utilities';
import { McsCloudHealthAlertConfigurationItems } from './mcs-cloudhealth-alert-configuration-items';

export class McsCloudHealthAlert {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public createdOn: Date = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public severity: string = undefined;

  @JsonProperty({ target: McsCloudHealthAlertConfigurationItems })
  public configurationItems: McsCloudHealthAlertConfigurationItems[] = undefined;
}