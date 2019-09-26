import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsBillingCostCentre } from './mcs-billing-cost-centre';

export class McsBillingSite extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty({ target: McsBillingCostCentre })
  public costCentres: McsBillingCostCentre[];
}
