export enum McsFeatureFlag {
  MaintenanceMode = 'EnableMaintenanceMode',
  SystemMessages = 'EnableSystemMessages',

  InternetPortView = 'EnableInternetPortView',
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

  Ordering = 'EnableOrdering',
  OrderingManagedServerCreate = 'EnableOrderingManagedServerCreate',
  OrderingManagedServerScale = 'EnableOrderingManagedServerScale',
  OrderingVdcStorageExpand = 'EnableOrderingVdcStorageExpand',
  OrderingVdcStorageProvision = 'EnableOrderingVdcStorageProvision',
  OrderingSqlProvision = 'EnableOrderingSqlProvision',
  OrderingManagedServerInviewLevelRaise = 'EnableOrderingManagedServerInviewLevelRaise',

}
