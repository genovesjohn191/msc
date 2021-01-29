import { JsonProperty } from '@app/utilities';

export type hardwareType =
  'UN'
  | 'BO'
  | 'LO'
  | 'VM'
  | 'BL';

export class McsServerHardware {
  @JsonProperty()
  public type: hardwareType = undefined;

  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public serialNumber: string = undefined;
}
