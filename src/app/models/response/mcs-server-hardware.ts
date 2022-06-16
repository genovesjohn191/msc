import { JsonProperty } from '@app/utilities';
import {
  HardwareType,
  hardwareTypeText,
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

  /**
   * Returns the type label
   */
  public get typeLabel(): string {
    return hardwareTypeText[this.type];
  }
}
