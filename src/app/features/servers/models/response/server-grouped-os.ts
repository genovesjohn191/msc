import { ServerOperatingSystem } from './server-operating-system';
import { JsonProperty } from 'json-object-mapper';

export class ServerGroupedOs {
  public platform: string;

  @JsonProperty({ type: ServerOperatingSystem })
  public os: ServerOperatingSystem[];

  constructor() {
    this.platform = undefined;
    this.os = undefined;
  }
}
