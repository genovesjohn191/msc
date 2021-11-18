import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsObjectQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'company_id' })
  public companyId?: string = undefined;

  @JsonProperty({ name: 'product_type' })
  public productType?: string = undefined;
}

export type CrispOrderState = '' | 'OPEN' | 'CLOSED';
export class McsObjectCrispOrderQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'state' })
  public state?: CrispOrderState = undefined;

  @JsonProperty({ name: 'assignee' })
  public assignee?: string = undefined;
}

export class McsObjectVdcQueryParams extends McsQueryParam {
  public vdcId?: string;
  public networkServiceId?: string;
  public companyId?: string;
  public networkId?: string;

  constructor() {
    super();
  }
}