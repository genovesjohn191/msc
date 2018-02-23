import { ServerResource } from './server-resource';

export class ServerEnvironment {
  public id: string;
  public name: string;
  public resources: ServerResource[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.resources = undefined;
  }
}
