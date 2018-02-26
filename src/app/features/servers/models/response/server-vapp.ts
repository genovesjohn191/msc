import { ServerVirtualMachine } from './server-virtual-machine';
import { JsonProperty } from 'json-object-mapper';

export class ServerVApp {
  public name: string;

  @JsonProperty({ type: ServerVirtualMachine })
  public virtualMachines: ServerVirtualMachine[];

  constructor() {
    this.name = undefined;
    this.virtualMachines = undefined;
  }
}
