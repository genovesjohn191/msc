import { McsServerClientObject } from './mcs-server-client-object';
import { JsonProperty } from 'json-object-mapper';

export class McsServerClone {
  public name: string;

  @JsonProperty({ type: McsServerClientObject })
  public clientReferenceObject: McsServerClientObject;

  constructor() {
    this.name = undefined;
    this.clientReferenceObject = undefined;
  }
}
