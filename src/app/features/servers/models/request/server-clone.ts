import { ServerClientObject } from './server-client-object';

export class ServerClone {
  public name: string;
  public clientReferenceObject: ServerClientObject;

  constructor() {
    this.name = undefined;
    this.clientReferenceObject = undefined;
  }
}
