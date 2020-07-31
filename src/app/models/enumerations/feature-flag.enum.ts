export enum McsFeatureFlag {
  MaintenanceMode = 'EnableMaintenanceMode',
  ExperimentalFeatures = 'EnableExperimentalFeatures',
  SystemMessages = 'EnableSystemMessages',

  InternetPortView = 'EnableInternetPortView',

  BatDetailsView = 'EnableBatDetailsView',
  BatView = 'EnableBatView',
  BatLinkedServicesView = 'EnableBatLinkedServicesView',

  ProductCatalog = 'EnableProductCatalog',
  CatalogProductListing = 'EnableCatalogProductListing',
  CatalogSolutionListing = 'EnableCatalogSolutionListing',

  ServerOsUpdates = 'EnableServerOsUpdates',

  MediaCatalog = 'EnableMediaCatalog',
  ResourceMediaUpload = 'EnableResourceMediaUpload',

  DedicatedVmRename = 'EnableDedicatedVmRename',
  DedicatedVmPasswordReset = 'EnableDedicatedVmPasswordReset',
  DedicatedVmSnapshotView = 'EnableDedicatedVmSnapshotView',
  DedicatedVmConsole = 'EnableDedicatedVmConsole',
  DedicatedVmMediaView = 'EnableDedicatedVmMediaView',
  DedicatedVmNicView = 'EnableDedicatedVmNicView',
  DedicatedVmStorageView = 'EnableDedicatedVmStorageView',

  AddonHidsView = 'EnableAddonHidsView',
  AddonAntiVirusView = 'EnableAddonAntiVirusView',
  AddonVmBackupView = 'EnableAddonVmBackupView',
  AddonServerBackupView = 'EnableAddonServerBackupView',

  Ordering = 'EnableOrdering',
  OrderingSqlProvision = 'EnableOrderingSqlProvision',
  OrderingServerBackupProvision = 'EnableOrderingServerBackupProvision',
  OrderingVmBackupProvision = 'EnableOrderingVmBackupProvision',
  OrderingAntiVirusProvision = 'EnableOrderingAntiVirusProvision',
  OrderingHidsProvision = 'EnableOrderingHidsProvision',
  OrderingManagedServerCreate = 'EnableOrderingManagedServerCreate',
  OrderingManagedServerScale = 'EnableOrderingManagedServerScale',
  OrderingVdcStorageExpand = 'EnableOrderingVdcStorageExpand',
  OrderingVdcStorageProvision = 'EnableOrderingVdcStorageProvision',
  OrderingManagedServerInviewLevelRaise = 'EnableOrderingManagedServerInviewLevelRaise',

  OrderingLicenseCountChange = 'EnableOrderingLicenseCountChange',
  OrderingMicrosoftRequestChange = 'EnableOrderingMicrosoftRequestChange',

  PublicCloud = 'EnablePublicCloud'
}
