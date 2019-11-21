export enum McsPermission {
  // Cloud VM
  CloudVmAccess = 'CloudVmAccess',
  CloudVmEdit = 'CloudVmEdit',
  CloudVmNicEdit = 'CloudVmNicEdit',
  CloudVmPowerStateEdit = 'CloudVmPowerStateEdit',
  CloudVmSnapshotAccess = 'CloudVmSnapshotAccess',
  CloudVmPatchManagement = 'CloudVmPatchManagement',
  CloudVmManagementIpView = 'CloudVmManagementIpView',

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
  SystemMessageEdit = 'SystemMessageEdit'
}
