import { JsonProperty } from 'json-object-mapper';
import {
  RunningStatus,
  RunningStatusSerialization
} from '../enumerations/running-status.enum';
import {
  VersionStatus,
  VersionStatusSerialization
} from '../enumerations/version-status.enum';

export class McsServerVmwareTools {
  public version: number;

  @JsonProperty({
    type: RunningStatus,
    serializer: RunningStatusSerialization,
    deserializer: RunningStatusSerialization
  })
  public runningStatus: RunningStatus;

  @JsonProperty({
    type: VersionStatus,
    serializer: VersionStatusSerialization,
    deserializer: VersionStatusSerialization
  })
  public versionStatus: VersionStatus;

  constructor() {
    this.runningStatus = undefined;
    this.version = undefined;
    this.versionStatus = undefined;
  }

  /**
   * Returns true if wmware tools were installed
   * Business rule: if version != 0, there are tools installed
   */
  public get hasTools(): boolean {
    return this.version > 0;
  }
}
