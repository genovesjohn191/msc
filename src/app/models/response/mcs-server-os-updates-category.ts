import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOsUpdatesCategory extends McsEntityBase {
  public categoryId: string;
  public name: string;
  public osType: string;
  public isSelected: boolean;

  constructor() {
    super();
    this.categoryId = undefined;
    this.name = undefined;
    this.osType = undefined;
    this.isSelected = false;
  }
}
