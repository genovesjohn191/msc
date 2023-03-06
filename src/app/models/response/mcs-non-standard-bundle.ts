import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsNonStandardBundle extends McsEntityBase {

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public quantity: number = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}
