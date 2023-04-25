import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsManagedSiemService extends McsEntityBase {
  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}
