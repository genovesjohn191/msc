import { McsEntityBase } from '../../../../core';

export class MediaServer extends McsEntityBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
