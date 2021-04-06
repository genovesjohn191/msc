import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsTenant extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;
}
