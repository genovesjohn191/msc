import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from './mcs-query-param';

export class McsReportParams extends McsQueryParam {
  @JsonProperty({ name: 'period_start' })
  public periodStart: string = undefined;

  @JsonProperty({ name: 'period_end' })
  public periodEnd?: string = undefined;

  @JsonProperty({ name: 'subscription_ids' })
  public subscriptionIds?: string = undefined;
}
