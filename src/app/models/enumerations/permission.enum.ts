export enum McsPermission {
  // Engineer
  InternalPrivateCloudEngineerAccess = 'InternalPrivateCloudEngineerAccess',
  InternalPublicCloudEngineerAccess = 'InternalPublicCloudEngineerAccess',

  // Self-Managed vCloud VM
  SelfManagedCloudVmAccess = 'SelfManagedCloudVmAccess',
  SelfManagedCloudVmEdit = 'SelfManagedCloudVmEdit',
  SelfManagedCloudVmNicEdit = 'SelfManagedCloudVmNicEdit',
  SelfManagedCloudVmPowerStateEdit = 'SelfManagedCloudVmPowerStateEdit',
  SelfManagedCloudVmSnapshotAccess = 'SelfManagedCloudVmSnapshotAccess',

  // Managed vCloud VM
  ManagedCloudVmAccess = 'ManagedCloudVmAccess',
  ManagedCloudVmEdit = 'ManagedCloudVmEdit',
  ManagedCloudVmNicEdit = 'ManagedCloudVmNicEdit',
  ManagedCloudVmPowerStateEdit = 'ManagedCloudVmPowerStateEdit',
  ManagedCloudVmSnapshotAccess = 'ManagedCloudVmSnapshotAccess',
  ManagedCloudVmPatchManagement = 'ManagedCloudVmPatchManagement',
  ManagedCloudVmManagementIpView = 'ManagedCloudVmManagementIpView',

  // vCenter VM
  DedicatedVmAccess = 'DedicatedVmAccess',
  DedicatedVmEdit = 'DedicatedVmEdit',
  DedicatedVmNicEdit = 'DedicatedVmNicEdit',
  DedicatedVmPowerStateEdit = 'DedicatedVmPowerStateEdit',
  DedicatedVmSnapshotAccess = 'DedicatedVmSnapshotAccess',
  DedicatedVmPatchManagement = 'DedicatedVmPatchManagement',
  DedicatedVmManagementIpView = 'DedicatedVmManagementIpView',

  // UCS Blade
  UcsBladeAccess = 'UcsBladeAccess',
  UcsBladeNicEdit = 'UcsBladeNicEdit',
  UcsBladePowerStateEdit = 'UcsBladePowerStateEdit',
  UcsBladeManagementIpView = 'UcsBladeManagementIpView',

  // Firewall
  FirewallConfigurationView = 'FirewallConfigurationView',
  FirewallPolicyEdit = 'FirewallPolicyEdit',
  FirewallSerialNumberView = 'FirewallSerialNumberView',

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

  // Storage Profile Utilisation
  OrganizationVdcView = 'OrganizationVdcView',

  // SaaS Backup
  SaasBackupView = 'SaasBackupView',
  SaasBackupEdit = 'SaasBackupEdit'
}
