import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export class McsServerOsUpdatesRequest extends McsApiJobRequestBase {
  public category: string[];
  public updates: string[];

  constructor() {
    super();
    this.category = undefined;
    this.updates = undefined;
  }
}
