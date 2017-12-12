import { ServerServiceType } from '../enumerations/server-service-type.enum';
import { ServerPowerState } from '../enumerations/server-power-state.enum';
import { ServerCommand } from '../enumerations/server-command.enum';

export class ServerClientObject {
  public serverId: any;
  public serviceType: ServerServiceType;
  public powerState: ServerPowerState;
  public commandAction: ServerCommand;
  public newName: string;
  public notificationStatus: string;
  public tooltipInformation: string;
}
