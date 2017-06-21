import { ServerPowerState } from './server-power-state.enum';
import { ServerCommand } from './server-command.enum';

export class ServerClientObject {
  public serverId: any;
  public powerState: ServerPowerState;
  public commandAction: ServerCommand;
  public notificationStatus: string;
  public tooltipInformation: string;
}
