import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOsUpdates extends McsEntityBase {
  @JsonProperty()
  public vendorId: string = undefined;

  @JsonProperty()
  public category: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public version: string = undefined;

  @JsonProperty()
  public properties: any = undefined;
}
