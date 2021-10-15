export enum McsFeatureFlag {
  OAuthV2 = 'EnableOAuthV2',
  MaintenanceMode = 'EnableMaintenanceMode',
  BypassSessionInactivityTimeout = 'EnableBypassSessionInactivityTimeout',
  SystemMessages = 'EnableSystemMessages',
  LaunchPad = 'EnableLaunchPad',
  Crisp = 'EnableCrisp',
  DashboardProjects = 'EnableLaunchPadDashboardProjects',
  ExperimentalFeatures = 'EnableExperimentalFeatures',

  WorkflowCreateVdcNetwork = 'EnableLaunchPadCreateVdcNetwork',

  AzureSlgTicket = 'EnableTicketingAzureSlg',
  AzureReservations = 'EnableAzureReservations',
  AzureSoftwareSubscriptions = 'EnablePublicCloudSoftwareSubscriptionListing',

  PublicCloudDashboard = 'EnablePublicCloudDashboard',
  AscAlert = 'EnableAscAlertListing',
  PlatformSecurityAdvisory = 'EnablePlatformSecurityAdvisoryListing',

  PrivateCloudDashboard = 'EnablePrivateCloudDashboard',

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

  StorageProfileBreakdown = 'EnableStorageProfileBreakdown',

  ServerOsUpdates = 'EnableServerOsUpdates',
}
