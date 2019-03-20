import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsBillingCostCentre } from './mcs-billing-cost-centre';

export class McsBillingSite extends McsEntityBase  {
  public name: string;
  public displayOrder: number;

  @JsonProperty({
    type: McsBillingCostCentre
  })
  public costCentres: McsBillingCostCentre[];

  constructor() {
    super();
    this.name = undefined;
    this.displayOrder = undefined;
    this.costCentres = undefined;
  }
}
