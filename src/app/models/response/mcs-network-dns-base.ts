import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';


export class McsNetworkDnsBase extends McsServiceBase {
  @JsonProperty()
  public isPrimary: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;
}
