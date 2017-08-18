import { ServerGuestOs } from './server-guest-os';
import { ServerServiceType } from '../enumerations/server-service-type.enum';

export class ServerTemplate {
  public serviceType: ServerServiceType;
  public guestOs: ServerGuestOs[];
}
