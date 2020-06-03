import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOsUpdatesCategory extends McsEntityBase {
  @JsonProperty()
  public categoryId: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public osType: string = undefined;

  @JsonProperty()
  public isSelected: boolean = undefined;
}
