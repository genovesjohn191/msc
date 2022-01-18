import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsVmSize extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public size: string = undefined;
}