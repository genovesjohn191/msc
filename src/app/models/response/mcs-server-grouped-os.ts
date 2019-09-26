import { JsonProperty } from '@peerlancers/json-serialization';
import { McsServerOperatingSystem } from './mcs-server-operating-system';

export class McsServerGroupedOs {
  @JsonProperty()
  public platform: string = undefined;

  @JsonProperty({ target: McsServerOperatingSystem })
  public os: McsServerOperatingSystem[] = undefined;
}
