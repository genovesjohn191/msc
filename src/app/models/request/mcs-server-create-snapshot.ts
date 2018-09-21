import { McsApiJobRequestBase } from '../mcs-api-job-request-base';

export class McsServerCreateSnapshot extends McsApiJobRequestBase {
  public preserveMemory: boolean;
  public preserveState: boolean;

  constructor() {
    super();
    this.preserveMemory = undefined;
    this.preserveState = undefined;
  }
}
