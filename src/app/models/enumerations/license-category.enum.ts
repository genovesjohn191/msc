import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Category {
    AdvancedThreatProtection = 1,
    APIManagement = 2,
    AppCenter = 3,
    ApplicationGateway = 4,
    ApplicationInsights = 5,
    Automation = 6,
    AzureActiveDirectory = 7,
    AzureActiveDirectoryB2C = 8,
    AzureActiveDirectoryDomainServices = 9,
    AzureAnalysisServices = 10,
    AzureAppService = 11,
    AzureBotService = 12,
    AzureCosmosDB = 13,
    AzureDataFactory = 14,
    AzureDataFactoryv2 = 15,
    AzureDatabaseforMariaDB = 16,
    AzureDatabaseforMySQL = 17,
    AzureDatabaseforPostgreSQL = 18,
    AzureDatabaseMigrationService = 19,
    AzureDatabricks = 20,
    AzureDDOSProtection = 21,
    AzureDevOps = 22,
    AzureDNS = 23,
    AzureFirewall = 24,
    AzureFrontDoorService = 25,
    AzureLabServices = 26,
    AzureMaps = 27,
    AzureMonitor = 28,
    AzureNetAppFiles = 29,
    AzureSearch = 30,
    AzureSiteRecovery = 31,
    AzureStack = 32,
    Backup = 33,
    Bandwidth = 34,
    BizTalkServices = 35,
    CloudServices = 36,
    CognitiveServices = 37,
    ContainerInstances = 38,
    ContainerRegistry = 39,
    ContentDeliveryNetwork = 40,
    DataBox = 41,
    DataCatalog = 42,
    DataExplorer = 43,
    DataLakeAnalytics = 44,
    DataLakeStore = 45,
    DataManagement = 46,
    DatacenterCapacity = 47,
    DigitalTwins = 48,
    Dynamics365forCustomerInsights = 49,
    EventGrid = 50,
    EventHubs = 51,
    ExpressRoute = 52,
    Functions = 53,
    HDInsight = 54,
    InsightandAnalytics = 55,
    IoTCentral = 56,
    IoTHub = 57,
    KeyVault = 58,
    LoadBalancer = 59,
    LogAnalytics = 60,
    LogicApps = 61,
    MachineLearningservice = 62,
    MachineLearningStudio = 63,
    MediaServices = 64,
    MicrosoftGenomics = 65,
    MultiFactorAuthentication = 66,
    NetworkWatcher = 67,
    NotificationHubs = 68,
    PowerBI = 69,
    PowerBIEmbedded = 70,
    RedisCache = 71,
    Scheduler = 72,
    SecurityCenter = 73,
    ServiceBus = 74,
    ServiceFabric = 75,
    ServiceFabricMesh = 76,
    SignalR = 77,
    SQLAdvancedThreatProtection = 78,
    SQLDataWarehouse = 79,
    SQLDatabase = 80,
    SQLServerStretchDatabase = 81,
    Storage = 82,
    StorSimple = 83,
    StreamAnalytics = 84,
    TimeSeriesInsights = 85,
    TrafficManager = 86,
    VirtualMachines = 87,
    VirtualMachinesLicenses = 88,
    VirtualNetwork = 89,
    VirtualWAN = 90,
    VisualStudio = 91,
    VisualStudioSubscription = 92,
    VNetGateway = 93,
    VPNGateway = 94,
    Windows10IoTCoreServices = 95,
    XamarinUniversity = 96
}

export const categoryText = {
    [Category.AdvancedThreatProtection]: 'Advanced Threat Protection',
    [Category.APIManagement]: 'API Management',
    [Category.AppCenter]: 'App Center',
    [Category.ApplicationGateway]: 'Application Gateway',
    [Category.ApplicationInsights]: 'Application Insights',
    [Category.Automation]: 'Automation',
    [Category.AzureActiveDirectory]: 'Azure Active Directory',
    [Category.AzureActiveDirectoryB2C]: 'Azure Active Directory B2C',
    [Category.AzureActiveDirectoryDomainServices]: 'Azure Active Directory Domain Services',
    [Category.AzureAnalysisServices]: 'Azure Analysis Services',
    [Category.AzureAppService]: 'Azure App Service',
    [Category.AzureBotService]: 'Azure Bot Service',
    [Category.AzureCosmosDB]: 'Azure Cosmos DB',
    [Category.AzureDataFactory]: 'Azure Data Factory',
    [Category.AzureDataFactoryv2]: 'Azure Data Factory v2',
    [Category.AzureDatabaseforMariaDB]: 'Azure Database for MariaDB',
    [Category.AzureDatabaseforMySQL]: 'Azure Database for MySQL',
    [Category.AzureDatabaseforPostgreSQL]: 'Azure Database for PostgreSQL',
    [Category.AzureDatabaseMigrationService]: 'Azure Database Migration Service',
    [Category.AzureDatabricks]: 'Azure Data bricks',
    [Category.AzureDDOSProtection]: 'Azure DDOS Protection',
    [Category.AzureDevOps]: 'Azure DevOps',
    [Category.AzureDNS]: 'Azure DNS',
    [Category.AzureFirewall]: 'Azure Firewall',
    [Category.AzureFrontDoorService]: 'Azure FrontDoor Service',
    [Category.AzureLabServices]: 'Azure Lab Services',
    [Category.AzureMaps]: 'Azure Maps',
    [Category.AzureMonitor]: 'Azure Monitor',
    [Category.AzureNetAppFiles]: 'Azure NetApp Files',
    [Category.AzureSearch]: 'Azure Search',
    [Category.AzureSiteRecovery]: 'Azure Site Recovery',
    [Category.AzureStack]: 'Azure Stack',
    [Category.Backup]: 'Backup',
    [Category.Bandwidth]: 'Bandwidth',
    [Category.BizTalkServices]: 'BizTalk Services',
    [Category.CloudServices]: 'Cloud Services',
    [Category.CognitiveServices]: 'Cognitive Services',
    [Category.ContainerInstances]: 'Container Instances',
    [Category.ContainerRegistry]: 'Container Registry',
    [Category.ContentDeliveryNetwork]: 'Content Delivery Network',
    [Category.DataBox]: 'DataBox',
    [Category.DataCatalog]: 'DataCatalog',
    [Category.DataExplorer]: 'Data Explorer',
    [Category.DataLakeAnalytics]: 'Data Lake Analytics',
    [Category.DataLakeStore]: 'Data Lake Store',
    [Category.DataManagement]: 'Data Management',
    [Category.DatacenterCapacity]: 'Datacenter Capacity',
    [Category.DigitalTwins]: 'DigitalTwins',
    [Category.Dynamics365forCustomerInsights]: 'Dynamics 365 for Customer Insights',
    [Category.EventGrid]: 'Event Grid',
    [Category.EventHubs]: 'Event Hubs',
    [Category.ExpressRoute]: 'Express Route',
    [Category.Functions]: 'Functions',
    [Category.HDInsight]: 'HD Insight',
    [Category.InsightandAnalytics]: 'Insight and Analytics',
    [Category.IoTCentral]: 'IoT Central',
    [Category.IoTHub]: 'IoT Hub',
    [Category.KeyVault]: 'Key Vault',
    [Category.LoadBalancer]: 'Load Balancer',
    [Category.LogAnalytics]: 'Log Analytics',
    [Category.LogicApps]: 'Logic Apps',
    [Category.MachineLearningservice]: 'Machine Learning Service',
    [Category.MachineLearningStudio]: 'Machine Learning Studio',
    [Category.MediaServices]: 'Media Services',
    [Category.MicrosoftGenomics]: 'Microsoft Genomics',
    [Category.MultiFactorAuthentication]: 'Multi-Factor Authentication',
    [Category.NetworkWatcher]: 'Network Watcher',
    [Category.NotificationHubs]: 'Notification Hubs',
    [Category.PowerBI]: 'PowerBI',
    [Category.PowerBIEmbedded]: 'PowerBI Embedded',
    [Category.RedisCache]: 'Redis Cache',
    [Category.Scheduler]: 'Scheduler',
    [Category.SecurityCenter]: 'Security Center',
    [Category.ServiceBus]: 'Service Bus',
    [Category.ServiceFabric]: 'Service Fabric',
    [Category.ServiceFabricMesh]: 'Service Fabric Mesh',
    [Category.SignalR]: 'SignalR',
    [Category.SQLAdvancedThreatProtection]: 'SQL Advanced Threat Protection',
    [Category.SQLDataWarehouse]: 'SQL Data Warehouse',
    [Category.SQLDatabase]: 'SQL Database',
    [Category.SQLServerStretchDatabase]: 'SQL Server Stretch Database',
    [Category.Storage]: 'Storage',
    [Category.StorSimple]: 'StorSimple',
    [Category.StreamAnalytics]: 'Stream Analytics',
    [Category.TimeSeriesInsights]: 'Time Series Insights',
    [Category.TrafficManager]: 'Traffic Manager',
    [Category.VirtualMachines]: 'Virtual Machines',
    [Category.VirtualMachinesLicenses]: 'Virtual Machines Licenses',
    [Category.VirtualNetwork]: 'Virtual Network',
    [Category.VirtualWAN]: 'Virtual WAN',
    [Category.VisualStudio]: 'Visual Studio',
    [Category.VisualStudioSubscription]: 'Visual Studio Subscription',
    [Category.VNetGateway]: 'VNet Gateway',
    [Category.VPNGateway]: 'VPN Gateway',
    [Category.Windows10IoTCoreServices]: 'Windows 10 IoT Core Services',
    [Category.XamarinUniversity]: 'Xamarin University'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class CategorySerialization
  extends McsEnumSerializationBase<Category> {
  constructor() { super(Category); }
}
