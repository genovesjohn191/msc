import { ServerRunningStatus } from '../enumerations/server-running-status.enum';
import { ServerVersionStatus } from '../enumerations/server-version-status.enum';

export class ServerVmwareTools {
  public runningStatus: ServerRunningStatus;
  public version: string;
  public versionStatus: ServerVersionStatus;
}
