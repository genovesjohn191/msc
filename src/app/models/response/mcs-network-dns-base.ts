import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';


export class McsNetworkDnsBase {
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
