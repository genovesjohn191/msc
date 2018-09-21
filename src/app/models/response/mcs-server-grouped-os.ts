import { McsServerOperatingSystem } from './mcs-server-operating-system';
import { JsonProperty } from 'json-object-mapper';

export class McsServerGroupedOs {
  public platform: string;

  @JsonProperty({ type: McsServerOperatingSystem })
  public os: McsServerOperatingSystem[];

  constructor() {
    this.platform = undefined;
    this.os = undefined;
  }
}
