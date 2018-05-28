import { McsEntityBase } from '../../base/mcs-entity.base';

export class McsApiConsole extends McsEntityBase {
  public url: string;
  public vmx: string;

  constructor() {
    super();
    this.url = undefined;
    this.vmx = undefined;
  }
}
