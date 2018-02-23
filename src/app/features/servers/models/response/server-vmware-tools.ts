import {
  ServerRunningStatus,
  ServerRunningStatusSerialization
} from '../enumerations/server-running-status.enum';
import {
  ServerVersionStatus,
  ServerVersionStatusSerialization
} from '../enumerations/server-version-status.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerVmwareTools {
  @JsonProperty({
    type: ServerRunningStatus,
    serializer: ServerRunningStatusSerialization,
    deserializer: ServerRunningStatusSerialization
  })
  public runningStatus: ServerRunningStatus;
  public version: string;

  @JsonProperty({
    type: ServerVersionStatus,
    serializer: ServerVersionStatusSerialization,
    deserializer: ServerVersionStatusSerialization
  })
  public versionStatus: ServerVersionStatus;

  constructor() {
    this.runningStatus = undefined;
    this.version = undefined;
    this.versionStatus = undefined;
  }
}
