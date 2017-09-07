import { ServerPowerState } from './enumerations/server-power-state.enum';

export class ServerList {
  public id: any;
  public name: string;
  public vdcName: string;
  public powerState: ServerPowerState;
}
