import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';

export class McsUcsDomainGroup extends McsEntityBase {
  @JsonProperty()
  public availabilityZone: string = undefined;
  
  @JsonProperty()
  public podName: string = undefined;
  
  @JsonProperty()
  public podId: number = undefined;

  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty()
  public name: string = undefined;
}
