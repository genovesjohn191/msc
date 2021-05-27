import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsAzureResourceTag } from './mcs-azure-resource-tag';

export class McsAzureResource extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public typeFriendlyName: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public subscriptionName: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public azureId: string = undefined;

  @JsonProperty()
  public portalUrl: string = undefined;

  @JsonProperty()
  public resourceGroupName: string = undefined;

  @JsonProperty({ target: McsAzureResourceTag })
  public tags: McsAzureResourceTag[] = undefined;
}
