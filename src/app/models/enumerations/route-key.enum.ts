export enum RouteKey {
  Dashboard = 1,

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
  OrderDetails,
  OrdersDashboard,
  OrderServerManagedScale,
  OrderVdcScale,
  OrderVdcStorageExpand,
  OrderVdcStorageCreate,
  OrderServiceInviewRaise,
  OrderAddAntiVirus,
  OrderAddHids,
  OrderAddServerBackup,
  OrderAddVmBackup,
  OrderAddBat,

  Internet,
  InternetDetails,
  InternetDetailsManagement,

  OtherTools,

  HttpErrorPage
}
