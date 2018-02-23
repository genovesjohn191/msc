import { ServerClientObject } from './server-client-object';

export class ServerCreateSnapshot {
  public preserveMemory: boolean;
  public preserveState: boolean;
  public clientReferenceObject: ServerClientObject;

  constructor() {
    this.preserveMemory = undefined;
    this.preserveState = undefined;
    this.clientReferenceObject = undefined;
  }
}
