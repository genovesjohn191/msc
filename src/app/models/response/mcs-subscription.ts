import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';

export class McsSubscription extends McsEntityBase {

  @JsonProperty()
  public uuid: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public friendlyName: string = undefined;

}
