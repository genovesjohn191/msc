import { JsonIgnore } from 'json-object-mapper';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export class McsServerClone extends McsApiJobRequestBase {
  public name: string;

  @JsonIgnore()
  public serverId: string;

  constructor() {
    super();
    this.name = undefined;
    this.serverId = undefined;
  }
}
