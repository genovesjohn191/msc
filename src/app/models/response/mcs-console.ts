import { McsEntityBase } from '../mcs-entity.base';

export class McsConsole extends McsEntityBase {
  public url: string;
  public vmx: string;

  constructor() {
    super();
    this.url = undefined;
    this.vmx = undefined;
  }
}
