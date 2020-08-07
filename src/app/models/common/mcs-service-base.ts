import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';


export abstract class McsServiceBase extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public name: string = undefined;
}
