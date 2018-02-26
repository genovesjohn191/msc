import { ServerClientObject } from './server-client-object';
import { JsonProperty } from 'json-object-mapper';

export class ServerClone {
  public name: string;

  @JsonProperty({ type: ServerClientObject })
  public clientReferenceObject: ServerClientObject;

  constructor() {
    this.name = undefined;
    this.clientReferenceObject = undefined;
  }
}
