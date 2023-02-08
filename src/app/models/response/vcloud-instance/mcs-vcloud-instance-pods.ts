import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../../common/mcs-entity.base';

export class McsVcloudInstancePods extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public availabilityZone: string = undefined;
}