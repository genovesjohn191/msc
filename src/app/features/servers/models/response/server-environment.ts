import { Resource } from '../../../resources';
import { JsonProperty } from 'json-object-mapper';

export class ServerEnvironment {
  public id: string;
  public name: string;

  @JsonProperty({ type: Resource })
  public resources: Resource[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.resources = undefined;
  }
}
