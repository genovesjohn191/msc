import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsLocation extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public friendlyName: string = undefined;

  @JsonProperty()
  public regionalFriendlyName: string = undefined;
}
