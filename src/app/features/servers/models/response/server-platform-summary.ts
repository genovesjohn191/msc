import { ServerPlatformType } from '../enumerations/server-platform-type.enum';

export class ServerPlatformSummary {
  public type: ServerPlatformType;
  public resourceId: string;
  public resourceName: string;
  public environmentName: string;
}
