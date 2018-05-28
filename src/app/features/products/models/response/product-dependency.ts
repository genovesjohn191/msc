import { McsEntityBase } from '../../../../core';

export class ProductDependency extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
