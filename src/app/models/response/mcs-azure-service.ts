import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsAzureService extends McsEntityBase {

  @JsonProperty()
  public uuid: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public friendlyName: string = undefined;

  @JsonProperty()
  public cloudHealthPortalUrl: string = undefined;

  @JsonProperty()
  public parentSubscriptionServiceId: string = undefined;
}
