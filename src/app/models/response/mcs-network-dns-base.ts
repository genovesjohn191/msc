import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  InstallBaseState,
  InstallBaseStateSerialization
} from '../enumerations/install-base-state.enum';

export class McsNetworkDnsBase extends McsEntityBase {
  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public isPrimary: boolean = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty({
    serializer: InstallBaseStateSerialization,
    deserializer: InstallBaseStateSerialization
  })
  public installBaseState: InstallBaseState = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public zoneCount: number = undefined;
}
