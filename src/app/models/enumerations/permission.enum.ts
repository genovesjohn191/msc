export enum McsPermission {
  // Engineer
  InternalEngineerAccess = 'InternalEngineerAccess',

  // Self-Managed VM
  SelfManagedCloudVmAccess = 'SelfManagedCloudVmAccess',
  SelfManagedCloudVmEdit = 'SelfManagedCloudVmEdit',
  SelfManagedCloudVmNicEdit = 'SelfManagedCloudVmNicEdit',
  SelfManagedCloudVmPowerStateEdit = 'SelfManagedCloudVmPowerStateEdit',
  SelfManagedCloudVmSnapshotAccess = 'SelfManagedCloudVmSnapshotAccess',

  // Managed VM
  ManagedCloudVmAccess = 'ManagedCloudVmAccess',
  ManagedCloudVmEdit = 'ManagedCloudVmEdit',
  ManagedCloudVmNicEdit = 'ManagedCloudVmNicEdit',
  ManagedCloudVmPowerStateEdit = 'ManagedCloudVmPowerStateEdit',
  ManagedCloudVmSnapshotAccess = 'ManagedCloudVmSnapshotAccess',
  ManagedCloudVmPatchManagement = 'ManagedCloudVmPatchManagement',
  ManagedCloudVmManagementIpView = 'ManagedCloudVmManagementIpView',

  // Dedicated VM
  DedicatedVmAccess = 'DedicatedVmAccess',
  DedicatedVmEdit = 'DedicatedVmEdit',
  DedicatedVmNicEdit = 'DedicatedVmNicEdit',
  DedicatedVmPowerStateEdit = 'DedicatedVmPowerStateEdit',
  DedicatedVmSnapshotAccess = 'DedicatedVmSnapshotAccess',
  DedicatedVmPatchManagement = 'DedicatedVmPatchManagement',
  DedicatedVmManagementIpView = 'DedicatedVmManagementIpView',

  // Firewall
  FirewallConfigurationView = 'FirewallConfigurationView',
  FirewallPolicyEdit = 'FirewallPolicyEdit',
  FirewallSerialNumberView = 'FirewallSerialNumberView',

  InternetView = 'InternetView',

  // Server Services
  AvView = 'AvView',
  AvEdit = 'AvEdit',
  HidsView = 'HidsView',
  HidsEdit = 'HidsEdit',

  // vCloud Catalog
  CatalogView = 'CatalogView',
  TemplateView = 'TemplateView',
  TemplateEdit = 'TemplateEdit',

  // Ticketing
  TicketView = 'TicketView',
  TicketCreate = 'TicketCreate',
  TicketCommentCreate = 'TicketCommentCreate',

  // Ordering
  OrderView = 'OrderView',
  OrderEdit = 'OrderEdit',
  OrderApprove = 'OrderApprove',

  // Accounts
  CompanyView = 'CompanyView',

  // System Message
  SystemMessageView = 'SystemMessageView',
  SystemMessageEdit = 'SystemMessageEdit',

  // Azure Resources
  AzureView = 'AzureView',

  // Storage Profile Utilisation
  OrganizationVdcView = 'OrganizationVdcView'
}
