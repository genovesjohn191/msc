import { ServerPlatformType } from '../enumerations/server-platform-type.enum';
import { ServerEnvironment } from './server-environment';

export class ServerPlatform {
  public type: ServerPlatformType;
  public environments: ServerEnvironment[];
}
