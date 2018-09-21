import { McsResource } from './mcs-resource';
import { JsonProperty } from 'json-object-mapper';

export class McsServerEnvironment {
  public id: string;
  public name: string;

  @JsonProperty({ type: McsResource })
  public resources: McsResource[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.resources = undefined;
  }
}
