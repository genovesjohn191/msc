import { ServerStorage } from './server-storage';
import { ServerNetwork } from './server-network';

export class ServerResource {
  public name: string;
  public serviceType: string;
  public availabilityZone: string;
  public cpuAllocation: number;
  public cpuReservation: number;
  public cpuLimit: number;
  public cpuUsed: number;
  public memoryAllocationMB: number;
  public memoryReservationMB: number;
  public memoryLimitMB: number;
  public memoryUsedMB: number;
  public storage: ServerStorage[];
  public networks: ServerNetwork[];
}
