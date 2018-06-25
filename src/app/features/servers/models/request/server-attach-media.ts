import { McsApiJobRequestBase } from '../../../../core';

export class ServerAttachMedia extends McsApiJobRequestBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
