import { Server } from '../../shared';

export class ServerList {
  public vdcName: string;
  public selected: boolean;
  public servers: Server[];

  constructor() {
    this.vdcName = '';
    this.selected = false;
    this.servers = new Array();
  }
}
