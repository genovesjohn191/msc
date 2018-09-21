import { McsEntityBase } from '../mcs-entity.base';

export class McsProductDependency extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
