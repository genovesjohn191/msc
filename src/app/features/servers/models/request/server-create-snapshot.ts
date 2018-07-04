import { McsApiJobRequestBase } from '../../../../core';

export class ServerCreateSnapshot extends McsApiJobRequestBase {
  public preserveMemory: boolean;
  public preserveState: boolean;

  constructor() {
    super();
    this.preserveMemory = undefined;
    this.preserveState = undefined;
  }
}
