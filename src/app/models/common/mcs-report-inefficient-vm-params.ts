import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from './mcs-query-param';

export class McsReportInefficientVmParams extends McsQueryParam {
  @JsonProperty({ name: 'period' })
  public period?: string = undefined;

  @JsonProperty({ name: 'subscription_ids' })
  public subscriptionIds?: string = undefined;
}
