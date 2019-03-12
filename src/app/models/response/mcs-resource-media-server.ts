import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceMediaServer extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
