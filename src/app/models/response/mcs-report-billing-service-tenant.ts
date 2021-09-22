import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';

export class McsReportBillingServiceTenant extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public initialDomain: string = undefined;

  @JsonProperty()
  public primaryDomain: string = undefined;
}
