import { ServerResourceStorage } from './server-resource-storage';
import { ServerResourceNetwork } from './server-resource-network';
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
  public url: string;
  public storage: ServerResourceStorage[];
  public networks: ServerResourceNetwork[];
  public catalogs: ServerCatalog[];
  public vApps: ServerVApp[];
}
