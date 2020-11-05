export enum RouteKey {
  Dashboard = 1,
  LaunchPad,
  LaunchPadCrispOrders,
  ReportOverview,
  ReportInsights,

  Azure,
  AzureManagedServices,
  AzureResources,

  Console,
  Maintenance,
  SystemMessagePage,

  Servers,
  ServerDetails,
  ServerDetailsManagement,
  ServerDetailsServices,
  ServerDetailsStorage,
  ServerDetailsSnapshots,
  ServerDetailsNics,
  ServerCreate,

  SystemMessages,
  SystemMessageCreate,
  SystemMessageEdit,

  VdcDetails,
  VdcDetailsOverview,
  VdcDetailsStorage,

  Media,
  Medium,
  MediumOverview,
  MediumServers,
  MediaUpload,

  Firewalls,
  FirewallDetails,
  FirewallDetailsOverview,
  FirewallDetailsPolicies,

  BackupAggregationTargets,
  BackupAggregationTargetsDetails,
  BackupAggregationTargetsDetailsManagement,
  BackupAggregationTargetsDetailsLinkedServices,

  Tickets,
  TicketDetails,
  TicketCreate,

  Notifications,
  Notification,

  ProductDetails, // Deprecated

  Catalog,
  CatalogProductsPlatform,
  CatalogProduct,
  CatalogSolution,
  CatalogSolutions,

  Orders,
  OrdersHistory,
  OrderDetails,
  OrdersDashboard,
  OrderServerManagedScale,
  OrderVdcScale,
  OrderVdcStorageExpand,
  OrderVdcStorageCreate,
  OrderServiceInviewRaise,
  OrderServiceCustomChange,
  OrderHostedDnsChange,
  OrderColocationStaffEscort,
  OrderAddAntiVirus,
  OrderAddHids,
  OrderAddServerBackup,
  OrderAddVmBackup,
  OrderAddBat,
  OrderMsLicenseCountChange,
  OrderMsRequestChange,
  OrderRemoteHands,
  OrderServerRequestPatch,

  Internet,
  InternetDetails,
  InternetDetailsManagement,

  OtherTools,
  Licenses,

  HttpErrorPage
}
