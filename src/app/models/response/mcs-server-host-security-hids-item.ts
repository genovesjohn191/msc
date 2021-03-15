import { JsonProperty } from '@app/utilities';
import {
  HidsProtectionLevel,
  HidsProtectionLevelSerialization
} from '../enumerations/hids-protection-level.enum';
import {
  HidsStatus,
  HidsStatusSerialization
} from '../enumerations/hids-status.enum';

export class McsServerHostSecurityHidsItem {

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty({
    serializer: HidsProtectionLevelSerialization,
    deserializer: HidsProtectionLevelSerialization
  })
  public mode: HidsProtectionLevel = undefined;

  @JsonProperty({
    serializer: HidsStatusSerialization,
    deserializer: HidsStatusSerialization
  })
  public status: HidsStatus = undefined;

  @JsonProperty()
  public statusMessage: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;
}

