import { McsEntityBase } from '../../../../core';

export class ServerVApp extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
