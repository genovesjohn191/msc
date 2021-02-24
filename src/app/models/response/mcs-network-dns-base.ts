import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsNetworkDnsBase extends McsEntityBase {

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public isPrimary: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public installBaseState: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: string = undefined;

  @JsonProperty()
  public zoneCount: number = undefined;

}
