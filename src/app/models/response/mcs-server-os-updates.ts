import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerOsUpdates extends McsEntityBase {
  public vendorId: string;
  public category: string;
  public name: string;
  public version: string;
  public properties: any;

  constructor() {
    super();
    this.vendorId = undefined;
    this.category = undefined;
    this.name = undefined;
    this.version = undefined;
    this.properties = undefined;
  }
}
