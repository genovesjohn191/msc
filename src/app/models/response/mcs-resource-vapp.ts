import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceVApp extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;
}
