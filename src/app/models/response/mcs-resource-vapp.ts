import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceVApp extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
