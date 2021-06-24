export enum McsFeatureFlag {
  OAuthV2 = 'EnableOAuthV2',
  MaintenanceMode = 'EnableMaintenanceMode',
  SystemMessages = 'EnableSystemMessages',
  LaunchPad = 'EnableLaunchPad',
  Crisp = 'EnableCrisp',
  ExperimentalFeatures = 'EnableExperimentalFeatures',

  AzureSlgTicket = 'EnableTicketingAzureSlg',
  AzureReservations = 'EnableAzureReservations',

  PublicCloudDashboard = 'EnablePublicCloudDashboard',

  PublicCloudResourceListing = 'EnablePublicCloudResourceListing',

  CatalogSolutionListing = 'EnableCatalogSolutionListing',

  MediaCatalog = 'EnableMediaCatalog',
  ResourceMediaUpload = 'EnableResourceMediaUpload',

  DedicatedVmRename = 'EnableDedicatedVmRename',
  DedicatedVmPasswordReset = 'EnableDedicatedVmPasswordReset',
  DedicatedVmSnapshotView = 'EnableDedicatedVmSnapshotView',
  DedicatedVmConsole = 'EnableDedicatedVmConsole',
  DedicatedVmMediaView = 'EnableDedicatedVmMediaView',
  DedicatedVmNicView = 'EnableDedicatedVmNicView',
  DedicatedVmStorageView = 'EnableDedicatedVmStorageView',

  OrderingServiceCustomChange = 'EnableOrderingServiceCustomRequest',
  OrderingVdcStorageProvision = 'EnableOrderingVdcStorageProvision',
  OrderingMicrosoftRequestChange = 'EnableOrderingMicrosoftRequestChange',
  DnsListing = 'EnablePrivateCloudNetworkDnsListing',

  CloudHealthServiceRequest = 'EnableCloudHealthServiceRequest',
  ProvisionServiceRequest = 'EnableProvisionServiceRequest',
}
