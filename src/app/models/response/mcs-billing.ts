import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsBillingSite } from './mcs-billing-site';

export class McsBilling extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsBillingSite })
  public sites: McsBillingSite[] = undefined;
}
