import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsBillingCostCentre extends McsEntityBase  {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public code: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;
}
