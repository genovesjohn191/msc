import { ServerPowerState } from '../enumerations/server-power-state.enum';
import { ServerCommand } from '../enumerations/server-command.enum';

export class ServerClientObject {
  public serverId: any;
  public powerState: ServerPowerState;
  public commandAction: ServerCommand;
  public notificationStatus: string;
  public tooltipInformation: string;
}
