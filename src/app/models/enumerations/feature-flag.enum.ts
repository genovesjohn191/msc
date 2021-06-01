export enum McsFeatureFlag {
  OAuthV2 = 'EnableOAuthV2',
  MaintenanceMode = 'EnableMaintenanceMode',
  SystemMessages = 'EnableSystemMessages',
  LaunchPad = 'EnableLaunchPad',
  ExperimentalFeatures = 'EnableExperimentalFeatures',

  AzureSlgTicket = 'EnableTicketingAzureSlg',

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
  DnsListing = 'enablePrivateCloudNetworkDnsListing',

  CloudHealthServiceRequest = 'EnableCloudHealthServiceRequest',
  ProvisionServiceRequest = 'EnableProvisionServiceRequest',
}
