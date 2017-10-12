import { ServerResourceStorage } from './server-platform-storage';
import { ServerNetwork } from './server-network';
import { ServerServiceType } from '../enumerations/server-service-type.enum';
import { ServerCatalog } from './server-catalog';
import { ServerVApp } from './server-vapp';

export class ServerResource {
  public id: string;
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
  public storage: ServerResourceStorage[];
  public networks: ServerNetwork[];
  public catalogs: ServerCatalog[];
  public vApps: ServerVApp[];
}
