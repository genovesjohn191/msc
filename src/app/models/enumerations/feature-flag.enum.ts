export enum McsFeatureFlag {
  OAuthV2 = 'EnableOAuthV2',
  MaintenanceMode = 'EnableMaintenanceMode',
  BypassSessionInactivityTimeout = 'EnableBypassSessionInactivityTimeout',
  LaunchPad = 'EnableLaunchPad',
  Crisp = 'EnableCrisp',
  DashboardProjects = 'EnableLaunchPadDashboardProjects',
  ExperimentalFeatures = 'EnableExperimentalFeatures',

  WorkflowCreateVdcNetwork = 'EnableLaunchPadCreateVdcNetwork',
  WorkflowsFirewall = 'EnableLaunchPadFirewallWorkflows',
  WorkflowsDedicatedBlade = 'EnabledLaunchPadDeprovisionDedicatedBlade',
  WorkflowsDedicatedBladeProvision = 'EnabledLaunchPadProvisionDedicatedBlade',
  WorkflowsUcsOrgCreate = 'EnableLaunchPadCreateUcsOrganisation',
  WorkflowsVirtualDataCenterDeprovision = 'EnableLaunchPadDeprovisionVirtualDataCenter',
  WorkflowsVirtualDataCenterProvision = 'EnableLaunchPadProvisionVirtualDataCenter',
  WorkflowsVirtualDataCenterStorageProvision = 'EnableLaunchPadProvisionVirtualDataCenterStorage',

  AzureSlgTicket = 'EnableTicketingAzureSlg',
  AzureReservations = 'EnableAzureReservations',
  AzureSoftwareSubscriptions = 'EnablePublicCloudSoftwareSubscriptionListing',

  AscAlert = 'EnableAscAlertListing',
  PlatformSecurityAdvisory = 'EnablePlatformSecurityAdvisoryListing',
  AzureServiceRequestSltReport = 'EnableAzureServiceRequestSltReport',
  HybridCloud = 'EnableHybridCloud',
  AzureManagementServiceListing = 'EnableAzureManagementServiceListing',
  ExtenderListing = 'EnableExtenderListing',
  ApplicationRecoveryListing = 'EnableApplicationRecoveryListing',
  NoticesListing = 'EnableNotices',

  PrivateCloudDashboard = 'EnablePrivateCloudDashboard',

  MediaCatalog = 'EnableMediaCatalog',
  ResourceMediaUpload = 'EnableResourceMediaUpload',

  DedicatedVmRename = 'EnableDedicatedVmRename',
  DedicatedVmSnapshotView = 'EnableDedicatedVmSnapshotView',
  DedicatedVmConsole = 'EnableDedicatedVmConsole',
  DedicatedVmMediaView = 'EnableDedicatedVmMediaView',
  DedicatedVmNicView = 'EnableDedicatedVmNicView',

  UcsBladeNicEdit = "EnableUcsBladeNicEdit",

  OrderingVdcStorageProvision = 'EnableOrderingVdcStorageProvision',
  OrderingStretchedVdcStorageExpand = 'EnableOrderingStretchedVdcStorageExpand',
  OrderingMicrosoftRequestChange = 'EnableOrderingMicrosoftRequestChange',
  DnsListing = 'EnablePrivateCloudNetworkDnsListing',

  CloudHealthServiceRequest = 'EnableCloudHealthServiceRequest',
  ProvisionServiceRequest = 'EnableProvisionServiceRequest',

  StorageProfileBreakdown = 'EnableStorageProfileBreakdown',
  StorageProfileDisabledValidation = 'EnableStorageProfileDisabledValidation',

  ServerOsUpdates = 'EnableServerOsUpdates',

  NewOAuth = 'EnableOAuthV2',

  KnowledgeBaseLink = 'EnableKnowledgeBaseLink',
  SaasBackup = 'EnableSaasBackup',
  PlannedWork = 'EnablePlannedWork',

  NonStandardBundlesListing = 'EnableAzureNonStandardBundles',
  PerpetualSoftwareListing = 'EnableAzurePerpetualSoftware',

  ManagedSecurity = 'EnableManagedSecurity'
}
