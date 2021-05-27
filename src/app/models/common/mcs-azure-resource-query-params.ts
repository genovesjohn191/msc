import { McsQueryParam } from './mcs-query-param';

export class McsAzureResourceQueryParams extends McsQueryParam {
  public tagName?: string;
  public tagValue?: string;

  constructor() {
    super();
    this.tagName = '';
    this.tagValue = '';
  }
}
