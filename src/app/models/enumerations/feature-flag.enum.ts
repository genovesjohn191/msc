export enum McsFeatureFlag {
  MaintenanceMode = 'EnableMaintenanceMode',
  SystemMessages = 'EnableSystemMessages',
  LaunchPad = 'EnableLaunchPad',
  ExperimentalFeatures = 'EnableExperimentalFeatures',

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

  OrderingVdcStorageProvision = 'EnableOrderingVdcStorageProvision',
  OrderingMicrosoftRequestChange = 'EnableOrderingMicrosoftRequestChange',
  DnsListing = 'enablePrivateCloudNetworkDnsListing',
}
