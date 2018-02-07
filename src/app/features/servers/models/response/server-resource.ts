import { ServerServiceType } from '../enumerations/server-service-type.enum';
import { ServerCompute } from './server-compute';
import { ServerStorage } from './server-storage';
import { ServerNetwork } from './server-network';
import { ServerCatalogItem } from './server-catalog-item';
import { ServerVApp } from './server-vapp';
import { ServerPlatformType } from '../enumerations/server-platform-type.enum';

export class ServerResource {
  public compute: ServerCompute;
  public storage: ServerStorage[];
  public networks: ServerNetwork[];
  public catalogItems: ServerCatalogItem[];
  public vApps: ServerVApp[];
  public id: string;
  public name: string;
  public platform: ServerPlatformType;
  public environmentName: string;
  public serviceType: ServerServiceType;
  public availabilityZone: string;
  public portalUrl: string;
}
