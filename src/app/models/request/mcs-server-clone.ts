import { McsApiJobRequestBase } from '../mcs-api-job-request-base';

export class McsServerClone extends McsApiJobRequestBase {
  public name: string;

  constructor() {
    super();
    this.name = undefined;
  }
}
