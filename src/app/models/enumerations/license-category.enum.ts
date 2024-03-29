import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AzureProducts {
  Unknown = 0,
  AppService = 1,
  ApplicationGateway = 2,
  ArchiveStorage = 3,
  Automation = 4,
  AzureActiveDirectory = 5,
  AzureActiveDirectoryDomainServices = 6,
  AzureAdvisor = 7,
  AzureBackup = 8,
  AzureBastion = 9,
  AzureBlueprints = 10,
  AzureCacheForRedis = 11,
  AzureCosmosDB = 12,
  AzureDatabaseForMariaDB = 13,
  AzureDatabaseForMySQL = 14,
  AzureDatabaseForPostgreSQL = 15,
  AzureDatabaseMigrationService = 16,
  AzureDDoSProtection = 17,
  AzureDedicatedHost = 18,
  AzureDevTestLabs = 19,
  AzureDNS = 20,
  AzureExpressRoute = 21,
  AzureFiles = 22,
  AzureFirewall = 23,
  AzureFrontDoor = 24,
  AzureMigrate = 25,
  AzureMonitor = 26,
  AzureNetAppFiles = 27,
  AzurePolicy = 28,
  AzurePrivateLink = 29,
  AzureResourceManagerTemplates = 30,
  AzureSiteRecovery = 31,
  AzureSQLDatabase = 32,
  BlobStorage = 33,
  CloudServices = 34,
  ContentDeliveryNetwork = 35,
  DiskStorage = 36,
  KeyVault = 37,
  LinuxVirtualMachines = 38,
  LoadBalancer = 39,
  ManagedDisks = 40,
  MicrosoftAzurePortal = 41,
  NetworkSecurityGroups = 42,
  NetworkWatcher = 43,
  Other = 44,
  QueueStorage = 45,
  SecurityCenter = 46,
  SQLServerOnVirtualMachines = 47,
  StorageAccounts = 48,
  TableStorage = 49,
  TrafficManager = 50,
  VirtualMachineScaleSets = 51,
  VirtualMachines = 52,
  VirtualNetwork = 53,
  VirtualWAN = 54,
  VPNGateway = 55,
  WebApplicationFirewall = 56,
  WebApps = 57,
  WindowsVirtualDesktop = 58
}

export const azureProductsText = {
  [AzureProducts.AppService]: 'App Service',
  [AzureProducts.ApplicationGateway]: 'Application Gateway',
  [AzureProducts.ArchiveStorage]: 'Archive Storage',
  [AzureProducts.Automation]: 'Automation',
  [AzureProducts.AzureActiveDirectory]: 'Azure Active Directory',
  [AzureProducts.AzureActiveDirectoryDomainServices]: 'Azure Active Directory Domain Services',
  [AzureProducts.AzureAdvisor]: 'Azure Advisor',
  [AzureProducts.AzureBackup]: 'Azure Backup',
  [AzureProducts.AzureBastion]: 'Azure Bastion',
  [AzureProducts.AzureBlueprints]: 'Azure Blueprints',
  [AzureProducts.AzureCacheForRedis]: 'Azure Cache for Redis',
  [AzureProducts.AzureCosmosDB]: 'Azure Cosmos DB',
  [AzureProducts.AzureDatabaseForMariaDB]: 'Azure Database for MariaDB',
  [AzureProducts.AzureDatabaseForMySQL]: 'Azure Database for MySQL',
  [AzureProducts.AzureDatabaseForPostgreSQL]: 'Azure Database for PostgreSQL',
  [AzureProducts.AzureDatabaseMigrationService]: 'Azure Database Migration Service',
  [AzureProducts.AzureDDoSProtection]: 'Azure DDoS Protection',
  [AzureProducts.AzureDedicatedHost]: 'Azure Dedicated Host',
  [AzureProducts.AzureDevTestLabs]: 'Azure DevTest Labs',
  [AzureProducts.AzureDNS]: 'Azure DNS',
  [AzureProducts.AzureExpressRoute]: 'Azure ExpressRoute',
  [AzureProducts.AzureFiles]: 'Azure Files',
  [AzureProducts.AzureFirewall]: 'Azure Firewall',
  [AzureProducts.AzureFrontDoor]: 'Azure Front Door',
  [AzureProducts.AzureMigrate]: 'Azure Migrate',
  [AzureProducts.AzureMonitor]: 'Azure Monitor',
  [AzureProducts.AzureNetAppFiles]: 'Azure NetApp Files',
  [AzureProducts.AzurePolicy]: 'Azure Policy',
  [AzureProducts.AzurePrivateLink]: 'Azure Private Link',
  [AzureProducts.AzureResourceManagerTemplates]: 'Azure Resource Manager templates',
  [AzureProducts.AzureSiteRecovery]: 'Azure Site Recovery',
  [AzureProducts.AzureSQLDatabase]: 'Azure SQL Database',
  [AzureProducts.BlobStorage]: 'Blob storage',
  [AzureProducts.CloudServices]: 'Cloud Services',
  [AzureProducts.ContentDeliveryNetwork]: 'Content Delivery Network',
  [AzureProducts.DiskStorage]: 'Disk Storage',
  [AzureProducts.KeyVault]: 'Key Vault',
  [AzureProducts.LinuxVirtualMachines]: 'Linux Virtual Machines',
  [AzureProducts.LoadBalancer]: 'Load Balancer',
  [AzureProducts.ManagedDisks]: 'Managed Disks',
  [AzureProducts.MicrosoftAzurePortal]: 'Microsoft Azure portal',
  [AzureProducts.NetworkSecurityGroups]: 'Network Security Groups',
  [AzureProducts.NetworkWatcher]: 'Network Watcher',
  [AzureProducts.Other]: 'Other',
  [AzureProducts.QueueStorage]: 'Queue Storage',
  [AzureProducts.SecurityCenter]: 'Security Center',
  [AzureProducts.SQLServerOnVirtualMachines]: 'SQL Server on Virtual Machines',
  [AzureProducts.StorageAccounts]: 'Storage Accounts',
  [AzureProducts.TableStorage]: 'Table Storage',
  [AzureProducts.TrafficManager]: 'Traffic Manager',
  [AzureProducts.VirtualMachineScaleSets]: 'Virtual Machine Scale Sets',
  [AzureProducts.VirtualMachines]: 'Virtual Machines',
  [AzureProducts.VirtualNetwork]: 'Virtual Network',
  [AzureProducts.VirtualWAN]: 'Virtual WAN',
  [AzureProducts.VPNGateway]: 'VPN Gateway',
  [AzureProducts.WebApplicationFirewall]: 'Web Application Firewall',
  [AzureProducts.WebApps]: 'Web Apps',
  [AzureProducts.WindowsVirtualDesktop]: 'Windows Virtual Desktop'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class AzureProductsSerialization
  extends McsEnumSerializationBase<AzureProducts> {
  constructor() { super(AzureProducts); }
}
