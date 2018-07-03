import { McsEntityBase } from '../../../../core';

export class ResourceVApp extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
