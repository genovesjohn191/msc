import { ServerClientObject } from './server-client-object';
import { JsonProperty } from 'json-object-mapper';

export class ServerCreateSnapshot {
  public preserveMemory: boolean;
  public preserveState: boolean;

  @JsonProperty({ type: ServerClientObject })
  public clientReferenceObject: ServerClientObject;

  constructor() {
    this.preserveMemory = undefined;
    this.preserveState = undefined;
    this.clientReferenceObject = undefined;
  }
}
