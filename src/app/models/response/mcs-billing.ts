import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsBillingSite } from './mcs-billing-site';

export class McsBilling extends McsEntityBase {
  public name: string;
  public displayOrder: number;

  @JsonProperty({
    type: McsBillingSite
  })
  public sites: McsBillingSite[];

  constructor() {
    super();
    this.name = undefined;
    this.displayOrder = undefined;
    this.sites = undefined;
  }
}
