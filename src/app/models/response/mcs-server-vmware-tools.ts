import { JsonProperty } from '@app/utilities';
import {
  RunningStatus,
  RunningStatusSerialization
} from '../enumerations/running-status.enum';
import {
  VersionStatus,
  VersionStatusSerialization
} from '../enumerations/version-status.enum';

export class McsServerVmwareTools {
  @JsonProperty()
  public version: number = undefined;

  @JsonProperty({
    serializer: RunningStatusSerialization,
    deserializer: RunningStatusSerialization
  })
  public runningStatus: RunningStatus = undefined;

  @JsonProperty({
    serializer: VersionStatusSerialization,
    deserializer: VersionStatusSerialization
  })
  public versionStatus: VersionStatus = undefined;

  /**
   * Returns true if wmware tools were installed
   * Business rule: if version != 0, there are tools installed
   */
  public get hasTools(): boolean {
    return this.version > 0;
  }

  public get hasToolsRunning(): boolean {
    return this.runningStatus === RunningStatus.Running;
  }
}
