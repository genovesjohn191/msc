import { JsonProperty } from 'json-object-mapper';
import {
  ServiceType,
  ServiceTypeSerialization
} from '../enumerations/service-type.enum';
import {
  VmPowerState,
  VmPowerStateSerialization
} from '../enumerations/vm-power-state.enum';
import {
  ServerCommand,
  ServerCommandSerialization
} from '../enumerations/server-command.enum';
import {
  JobStatus,
  JobStatusSerialization
} from '../enumerations/job-status.enum';

export class McsServerClientObject {
  public serverId?: any;
  public userId?: string;
  public newName?: string;
  public processingText?: string;

  @JsonProperty({
    type: ServerCommand,
    serializer: ServerCommandSerialization,
    deserializer: ServerCommandSerialization
  })
  public commandAction?: ServerCommand;

  @JsonProperty({
    type: VmPowerState,
    serializer: VmPowerStateSerialization,
    deserializer: VmPowerStateSerialization
  })
  public powerState?: VmPowerState;

  @JsonProperty({
    type: ServiceType,
    serializer: ServiceTypeSerialization,
    deserializer: ServiceTypeSerialization
  })
  public serviceType?: ServiceType;

  @JsonProperty({
    type: JobStatus,
    serializer: JobStatusSerialization,
    deserializer: JobStatusSerialization
  })
  public notificationStatus?: JobStatus;

  constructor() {
    this.serverId = undefined;
    this.userId = undefined;
    this.serviceType = undefined;
    this.powerState = undefined;
    this.commandAction = undefined;
    this.newName = undefined;
    this.notificationStatus = undefined;
    this.processingText = undefined;
  }
}
