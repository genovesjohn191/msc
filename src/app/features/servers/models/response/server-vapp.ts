import { ServerVirtualMachine } from './server-virtual-machine';

export class ServerVApp {
  public name: string;
  public virtualMachines: ServerVirtualMachine[];

  constructor() {
    this.name = undefined;
    this.virtualMachines = undefined;
  }
}
