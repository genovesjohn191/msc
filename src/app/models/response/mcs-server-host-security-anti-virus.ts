import { JsonProperty } from '@peerlancers/json-serialization';
import { AntiVirusStatus } from '../enumerations/anti-virus-status.enum';

export class McsServerHostSecurityAntiVirus {

  @JsonProperty()
  public provisioned: boolean = undefined;

  @JsonProperty()
  public realTimeScanEnabled: boolean = undefined;

  @JsonProperty()
  public scheduleEnabled: boolean = undefined;

  @JsonProperty()
  public schedule: string = undefined;

  @JsonProperty()
  public status: AntiVirusStatus = undefined;

  @JsonProperty()
  public statusMessage: string = undefined;
}

