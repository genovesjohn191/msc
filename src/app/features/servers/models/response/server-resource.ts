import { ServerServiceType } from '../enumerations/server-service-type.enum';
import { ServerCompute } from './server-compute';
import { ServerStorage } from './server-storage';
import { ServerNetwork } from './server-network';
import { ServerCatalogItem } from './server-catalog-item';
import { ServerVApp } from './server-vapp';

export class ServerResource {
  public id: string;
  public name: string;
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public portalUrl: string;
  public compute: ServerCompute;
  public storage: ServerStorage[];
  public networks: ServerNetwork[];
  public catalogItems: ServerCatalogItem[];
  public vApps: ServerVApp[];
}
