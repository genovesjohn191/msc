import { ServerPlatformStorage } from './server-platform-storage';
import { ServerNetwork } from './server-network';
import { ServerServiceType } from '../enumerations/server-service-type.enum';

export class ServerResource {
  public name: string;
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public cpuAllocation: number;
  public cpuReservation: number;
  public cpuLimit: number;
  public cpuUsed: number;
  public memoryAllocationMB: number;
  public memoryReservationMB: number;
  public memoryLimitMB: number;
  public memoryUsedMB: number;
  public storage: ServerPlatformStorage[];
  public networks: ServerNetwork[];
}
