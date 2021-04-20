import { McsQueryParam } from './mcs-query-param';

export class McsTerraformTagQueryParams extends McsQueryParam {
  public moduleId?: string;

  constructor() {
    super();
    this.moduleId = '';
  }
}
