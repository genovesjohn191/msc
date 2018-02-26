import { ServerResource } from './server-resource';
import { JsonProperty } from 'json-object-mapper';

export class ServerEnvironment {
  public id: string;
  public name: string;

  @JsonProperty({ type: ServerResource })
  public resources: ServerResource[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.resources = undefined;
  }
}
