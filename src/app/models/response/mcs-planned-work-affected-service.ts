import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';

export class McsPlannedWorkAffectedService extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;
}
