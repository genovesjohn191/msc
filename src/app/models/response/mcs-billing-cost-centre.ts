import { McsEntityBase } from '../common/mcs-entity.base';

export class McsBillingCostCentre extends McsEntityBase  {
  public name: string;
  public code: string;
  public displayOrder: number;

  constructor() {
    super();
    this.name = undefined;
    this.code = undefined;
    this.displayOrder = undefined;
  }
}
