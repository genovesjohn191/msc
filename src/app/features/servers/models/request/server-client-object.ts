import {
  ServerServiceType,
  ServerServiceTypeSerialization
} from '../enumerations/server-service-type.enum';
import {
  ServerPowerState,
  ServerPowerStateSerialization
} from '../enumerations/server-power-state.enum';
import {
  ServerCommand,
  ServerCommandSerialization
} from '../enumerations/server-command.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerClientObject {
  public serverId?: any;
  public userId?: string;

  @JsonProperty({
    type: ServerServiceType,
    serializer: ServerServiceTypeSerialization,
    deserializer: ServerServiceTypeSerialization
  })
  public serviceType?: ServerServiceType;

  @JsonProperty({
    type: ServerPowerState,
    serializer: ServerPowerStateSerialization,
    deserializer: ServerPowerStateSerialization
  })
  public powerState?: ServerPowerState;

  @JsonProperty({
    type: ServerCommand,
    serializer: ServerCommandSerialization,
    deserializer: ServerCommandSerialization
  })
  public commandAction?: ServerCommand;
  public newName?: string;
  public isOperable?: boolean;
  public notificationStatus?: string;
  public processingText?: string;

  constructor() {
    this.serverId = undefined;
    this.userId = undefined;
    this.serviceType = undefined;
    this.powerState = undefined;
    this.commandAction = undefined;
    this.newName = undefined;
    this.isOperable = undefined;
    this.notificationStatus = undefined;
    this.processingText = undefined;
  }
}
