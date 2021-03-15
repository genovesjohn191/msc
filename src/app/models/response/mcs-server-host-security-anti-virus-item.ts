import { JsonProperty } from '@app/utilities';
import {
  AntiVirusStatus,
  AntiVirusStatusSerialization
} from '../enumerations/anti-virus-status.enum';

export class McsServerHostSecurityAntiVirusItem {

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public realTimeScanEnabled: boolean = undefined;

  @JsonProperty()
  public scheduleEnabled: boolean = undefined;

  @JsonProperty()
  public schedule: string = undefined;

  @JsonProperty({
    serializer: AntiVirusStatusSerialization,
    deserializer: AntiVirusStatusSerialization
  })
  public status: AntiVirusStatus = undefined;

  @JsonProperty()
  public statusMessage: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;
}

