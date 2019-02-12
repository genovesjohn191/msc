import { McsEntityBase } from '../mcs-entity.base';

export class McsServerOsUpdatesCategory extends McsEntityBase {
  public categoryId: string;
  public name: string;
  public osType: string;

  constructor() {
    super();
    this.categoryId = undefined;
    this.name = undefined;
    this.osType = undefined;
  }
}
