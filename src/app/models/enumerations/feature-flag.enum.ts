export enum McsFeatureFlag {
  MaintenanceMode = 'EnableMaintenanceMode',
  SystemMessages = 'EnableSystemMessages',

  InternetPortView = 'EnableInternetPortView',

  AddonBackupAggregationTargetDetailsView = 'EnableAddonBackupAggregationTargetDetailsView',
  AddonBackupAggregationTargetView = 'EnableAddonBackupAggregationTargetView',

  ProductCatalog = 'EnableProductCatalog',

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
}
