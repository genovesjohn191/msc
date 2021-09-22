export enum RouteKey {
  Dashboard = 1,

  LaunchPad,
  LaunchPadSearch,
  LaunchPadWorkflowLaunch,
  LaunchPadAzureDeployments,
  LaunchPadAzureDeploymentCreate,
  LaunchPadAzureDeploymentDetails,
  LaunchPadAzureDeploymentDetailsOverview,
  LaunchPadAzureDeploymentDetailsHistory,
  LaunchPadNetworkDbSites,
  LaunchPadNetworkDbPods,
  LaunchPadNetworkDbVlans,
  LaunchPadNetworkDbVnis,
  LaunchPadNetworkDbUseCases,
  LaunchPadNetworkDbMulticastIps,
  LaunchPadNetworkDbNetworks,
  LaunchPadNetworkDbNetworkCreate,
  LaunchPadNetworkDbNetworkDetails,
  LaunchPadNetworkDbNetworkDetailsOverview,
  LaunchPadNetworkDbNetworkDetailsEvents,
  LaunchPadNetworkDbNetworkDetailsEdit,
  LaunchPadNetworkDbNetworkDetailsVlans,
  LaunchPadCrispOrders,
  LaunchPadCrispOrderDetails,
  LaunchPadCrispOrderDetailsElements,
  LaunchPadDashboardProjects,
  LaunchPadDashboardProjectDetails,
  LaunchPadDashboardProjectDetailsTasks,

  ReportOverview,
  ReportInsights,

  Azure,
  AzureSoftwareSubscriptions,
  AzureSubscriptions,
  AzureResources,
  AzureReservations,

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

  DnsListing,
  DnsDetails,
  DnsManagement,
  DnsZones,

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
  OrderColocationDeviceRestart,
  OrderAddAntiVirus,
  OrderAddHids,
  OrderAddServerBackup,
  OrderAddVmBackup,
  OrderAddBat,
  OrderMsLicenseCountChange,
  OrderMsRequestChange,
  OrderRemoteHands,
  OrderServerRequestPatch,
  OrderAddSimpleFirewallChange,
  OrderModifySimpleFirewallChange,
  OrderRemoveSimpleFirewallChange,
  OrderChangeInternetPortPlan,
  OrderAzureProfessionalServiceRequest,

  Internet,
  InternetDetails,
  InternetDetailsManagement,

  OtherTools,
  Licenses,

  Billing,
  BillingSummary,
  BillingService,
  BillingTabular,

  HttpErrorPage
}
