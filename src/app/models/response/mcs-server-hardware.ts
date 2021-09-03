import { JsonProperty } from '@app/utilities';
import {
  HardwareType,
  HardwareTypeSerialization
} from '../enumerations/hardware-type.enum';

export class McsServerHardware {
  @JsonProperty({
    serializer: HardwareTypeSerialization,
    deserializer: HardwareTypeSerialization
  })
  public type: HardwareType = undefined;

  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public serialNumber: string = undefined;
}
