import { McsQueryParam } from './mcs-query-param';

export class McsObjectQueryParams extends McsQueryParam {
  public companyId?: string;
  public productType?: string;

  constructor() {
    super();
  }
}

export type CrispOrderState = '' | 'OPEN' | 'CLOSED';
export class McsObjectCrispOrderQueryParams extends McsQueryParam {
  public state?: CrispOrderState;
  public assignee?: string;

  constructor() {
    super();
  }
}

export class McsObjectProjectsQueryParams extends McsQueryParam {
  public state?: CrispOrderState;
  public companyId?: string;

  constructor() {
    super();
  }
}
