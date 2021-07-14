import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ProductType {
  Unknown = 0,
  DotNetApplicationCentre,
  TwentyFourPortSwitch,
  FourtyEightPortSwitch,
  GigabitFourtyEightPortSwitch,
  AddOns,
  AdditionalIpAddresses,
  Antenna,
  ApplicationForId,
  ApplicationRecovery,
  AsdSensorProgram,
  AuditAndComplianceSeries,
  AzureEssentialsCsp,
  AzureEssentialsEnterpriseAgreement,
  AzureOperationsServiceRequest,
  ManagedAzureServices,
  AzureProductConsumption,
  AzureProductConsumptionEnterpriseAgreement,
  AzureReservation,
  AzureSoftwareSubscription,
  BackupAggregationTarget,
  BiztalkEnterpriseServer,
  BizTalkHppaEnterpriseProcessorLicense,
  BiztalkHppaStandardProcessorLicense,
  BiztalkMqSeriesEnterpriseProcessorLicense,
  BiztalkRosettaNetEnterpriseProcessorLicense,
  BiztalkRosettaNetStandardProcessorLicense,
  BiztalkSapEnterpriseProcessorLicense,
  BiztalkServer,
  BiztalkMqSupplierEnablementProcessorLicense,
  BookIntellicentreStaffEscort,
  BrickFirewall,
  CarrierDuctAccess,
  CarrierHalfRack,
  CarrierRackSpace,
  CdRomDisketteDriveAssemblyOption,
  CloudFirewall,
  CloudLoadBalancer,
  CloudPerformanceServer,
  CloudServer,
  CloudServerPrimary,
  CloudServicesGateway,
  ColocationGeneral,
  ColocationDeviceRestart,
  ColocationMigrationService,
  ColocationRemoteHands,
  ColocationServerBackup,
  CoreGatewayService,
  CoreIntrusionPreventionService,
  CorePerimeterFirewallPolicy,
  CpeSolutionCharges,
  CrossConnect,
  CrossConnectCabling,
  CspLicenses,
  CustomColoDevice,
  CustomerDedicatedFirewall,
  DataCentreInterconnect,
  DataCentresCrossConnect,
  DataHallFitOut,
  DatabaseMonitoringServices,
  DatabaseProfessionalServices,
  DbaOracle,
  DbaSqlServer,
  DdosProtection,
  DdosReporting,
  DedicatedHostingGeneral,
  DedicatedLoadBalancing,
  DedicatedManagedFirewall,
  DedicatedManagedFirewallSingle,
  DedicatedNetworkUtm,
  DedicatedServer,
  DedicatedServerVmInstance,
  DedicatedSras,
  DedicatedVcenterServer,
  DeveloperCloud,
  DisasterRecoverDiskSpace,
  DisasterRecoverLaptop,
  DisasterRecoverServer,
  DisasterRecoverGeneralType,
  DnsGeneralType,
  DsdGatewayHighlyProtected,
  DsdGatewayInConfidence,
  DsdGatewayProtected,
  DsdGatewayProtectedCyberguardPort,
  DuctMqSfromSpace,
  EmailSandboxing,
  EnableDisableSignature,
  EncryptionLTwo,
  EngineeringServicesAndRemoteHands,
  EnvironmentMigration,
  EnvironmentalMonitoring,
  ExchangeConferencingServer,
  ExchangeEnterpriseServer,
  ExchangeOutlookAccessPerUser,
  ExchangeWebMailPlusPerUser,
  ExtenderCustomerSource,
  ExtenderMtAz,
  Fedlink,
  FileStorageSanServer,
  FirewallAnalytics,
  FirewallChangeComplex,
  FirewallChangeSimpleAddRule,
  FirewallChangeSimpleDeleteRule,
  FirewallChangeSimpleModifyRule,
  FirewallDedicated,
  FirewallSoftwareLicense,
  FirewallVa,
  FirewallVlan,
  FirewallVxlan,
  FrontpagePerUser,
  FrameAccessToCoLocation,
  GatewayFullRack,
  GatewayHalfRack,
  GatewayReportingPremium,
  GatewayReportingStandard,
  GatewayReportingSuperPremium,
  GlobalServerLoadBalancing,
  GovThirdPartyVendorQuote,
  GovernmentMisc,
  Govlink,
  HardDiskPluggableUltraThree,
  HardwareMonitoring,
  HipsExemptionRequest,
  HostSecurity,
  HostedDnsChange,
  HostingClientToSiteVpn,
  HostingInternetPort,
  HostingInternetPortUnlimitedTransfer,
  HostingSiteToSiteVpn,
  HostingSolutionsDocument,
  HpServerLarge,
  HpServerMedium,
  HpServerSmall,
  HpServerVerySmall,
  Icon,
  InfrastructureProxy,
  IntellicentreFacilitiesServicesBundle,
  IntellicentreMisc,
  IntellicentreTapeBackupIncremental,
  IntellihandsGeneral,
  IntellihandsTierOne,
  IntellihandsTierTwo,
  IntellihandsTierThree,
  IntellihandsWithRecurringCharge,
  Internet,
  Ips,
  IpsReporting,
  KeyboardUKeyboardDrawer,
  KhaLeadEngineerAssignment,
  LargeVolumeNas,
  LaunchConnect,
  Licensing,
  LinuxManagedHostingAdvanced,
  LinuxManagedHostingStandard,
  LoadBalancerVa,
  LoadBalancingGeneral,
  LoadBalancingChange,
  MacquarieEthernetToColoPort,
  MagentoServices,
  MailFilteringChange,
  MailRelay,
  ManagedAzureCsp,
  ManagedAzureEnterpriseAgreement,
  ManagedExchangeEnterpriseA,
  ManagedExchangeEnterpriseB,
  ManagedExchangeEnterpriseC,
  ManagedExchangeChangeCustomerAdministrator,
  ManagedExchangeChangeMailPackage,
  ManagedExchangeMailboxImportExport,
  ManagedExchangeMailboxRecoveryFromArchive,
  ManagedExchangeRestoreDeletedMailbox,
  ManagedExchangeSslCertificateInstallationRenewal,
  ManagedRouter,
  ManagedRuSpace,
  ManagedServiceRestart,
  ManagedStorageLun,
  ManagedStorageSanDisk,
  ManagedSwitch,
  ManagementFirewallVa,
  MegaportPointToPoint,
  MegaportPointToPointVirtualCircuits,
  MemorySdram,
  MiniRack,
  MonitorUtilityShelf,
  MonitorOpal,
  MonthlyHidsReportingUatTest,
  MsFrontpage,
  MsOfficeProfessionalEdition,
  MsOfficeStandardEdition,
  MsProjectProfessionalEdition,
  MsProjectServer,
  MsProjectStandardEdition,
  MsVisioProfessionalEdition,
  MsVisioStandardEdition,
  NasRaidOneDisk,
  NasRaidOneServer,
  NasRaidSDisk,
  NasRaidSServer,
  Nat,
  NetworkAttachedStorage,
  NetworkBackupIncremental,
  NewProfessionalService,
  NonStandardDedicatedLoadBalancing,
  NonStandardFirewall,
  NonStandardGatewayRouter,
  NonStandardHardwareMonitoring,
  NonStandardServer,
  NonStandardVirtualManagedServer,
  NonStandardChange,
  ObjectStorageNamespace,
  OfficeProfessionalEnterpriseEditionPerUser,
  OfficeStandardEditionPerUser,
  OffsiteBackupTarget,
  OffsiteTapeBackupStorage,
  OneOffTapeRotation,
  OnlineAuthentication,
  OperatingSystemPatchRequest,
  PacketForensicsDedicated,
  PerformanceInternet,
  PortSwitch,
  PowerSupply,
  PowerSupplyHotPlug,
  PowerSupplyHotPlugOptionKit,
  PremiumInternet,
  PrimaryDedicatedStorage,
  PrimaryDns,
  PrimaryVdcStorage,
  PrivilegeAccessManagement,
  ProcessorPentiumIII,
  ProcessorXeon,
  ProcessorPentiumIIIXeon,
  ProfessionalServices,
  ProjectServerPerUser,
  ProjectManagementCharges,
  ProjectProfessionalPerUser,
  ProjectStandardEditionPerUser,
  ProtectedBackupAggregationTarget,
  ProtectedCloudApplicationRecovery,
  ProtectedDaas,
  ProtectedObjectStorage,
  ProtectedVmBackup,
  RackInstallation,
  RackReservation,
  RackSwitchBox,
  RebuildVm,
  RedundantFirewallCharges,
  RemoteVmBackup,
  RequestFailoverFailback,
  Room,
  SanRaidOneDisk,
  SanRaidOneServer,
  SanRaidSDisk,
  SanRaidSServer,
  SanSanReplicationPlayback,
  SanToSanReplication,
  ScanningExemptionRequest,
  SecondaryDns,
  SecondaryVdcStorage,
  SecureCloudExchange,
  SecureDnsServices,
  SecureEmailGateway,
  SecureMail,
  SecureWebFilteringChange,
  SecureWebGateway,
  SecurityActiveDirectoryDesignDeploy,
  SecurityApplicationThreatRiskAssessment,
  SecurityApplicationVulnerabilityAssessment,
  SecurityApplicationInfrastructureDevelopment,
  SecurityAsNzComplianceAssistCertify,
  SecurityBusinessContinuityPlanning,
  SecurityChangeManagement,
  SecurityCommonCriteriaEvaluations,
  SecurityCorporateItThreatRiskAssessment,
  SecurityDataClassification,
  SecurityDisasterRecoveryPlanning,
  SecurityGatekeeperAdviceImplementation,
  SecurityHealthChecks,
  SecurityIncidentInvestigationForensics,
  SecurityPartnershipsOutsourcing,
  SecurityPenetrationTesting,
  SecurityPkiAdviceImplementation,
  SecurityPolicyDevelopmentImplementation,
  SecurityProcedureDevelopmentImplementation,
  SecuritySecureEmailAdviceImplementation,
  SecurityStrategiesAndFrameworks,
  SecurityTesting,
  SecurityTrainingAwareness,
  SecurityAccessAudit,
  SecurityAccessAuthorization,
  SecurityAccessLogin,
  SecurityAdvisoryReport,
  SecurityAntivirusFeesHttpDedicated,
  SecurityAntivirusFeesHttpShared,
  SecurityAntivirusFeesEmailDedicated,
  SecurityAntivirusFeesEmailShared,
  SecurityReportingFees,
  SecurityTrainingFees,
  SelfManagedVmBackupVirtualMachineImage,
  SelfService,
  SelfManagedVdc,
  ServerAntiVirus,
  ServerBackup,
  ServerHostIntrusionPreventionSystem,
  ServiceRequestBundle,
  SharedEmailPackage,
  SharedHostingGeneralType,
  SharedHostingPlanA,
  SharedHostingPlanB,
  SharedHostingPlanC,
  SharedHostingPlanD,
  SharedHostingPlanE,
  SharedHostingPlanF,
  SharedHostingPlanG,
  SharedHostingPlanH,
  SharedHostingPlanI,
  SharedHostingPlanJ,
  SharedLoadBalancing,
  SharedStaticHostingPackage,
  SiemAsAService,
  SigBoxDedicated,
  SigBoxShared,
  SocAsAService,
  SoftwareGeneralType,
  SolarisServerLarge,
  SolarisServerMedium,
  SolarisServerSmall,
  SqlServerEnterpriseEdition,
  SqlServerStandardEdition,
  SqlServerEnterpriseEditionPerUser,
  SqlServerStandardEditionPerUser,
  SqlServerWorkgroupEdition,
  StandardBackupGeneral,
  StandardFullRack,
  StandardSquareMetres,
  StandardUserWebEmailServices,
  StorageGeneral,
  StretchedCluster,
  StretchedDedicatedStorage,
  StretchedSelfManagedVdc,
  StretchedVirtualDataCentre,
  StretchedVirtualDataCentreStorage,
  SunCobalt,
  TapeBackupIncremental,
  TapeBackupRestore,
  TestAutomationProductForHosting,
  IntegratedKeyboardMonitor,
  ThirdPartyVendorQuotation,
  TieCable,
  TopUpProfessionalService,
  TransactionSanDisk,
  TransactionSanServer,
  TransferSwitch,
  TwoFactorAuthentication,
  UrlMonitor,
  UserAndEntityBehaviorAnalytics,
  VdcStorage,
  VeeamBackupAndReplicationLicense,
  VeeamCloudBackup,
  VirtualCrossConnect,
  VirtualDataCentre,
  VirtualDataCentreVmInstance,
  VirtualDba,
  VirtualDrMelbourneVlan,
  VirtualDrMtsg,
  VirtualDrServicePlan,
  VirtualDrVirtualFirewallSwitch,
  VirtualDrVirtualServer,
  VirtualFirewall,
  VirtualManagedServer,
  VirtualPrivateServer,
  VisioProfessionalEditionPerUser,
  VisioStandardEditionPerUser,
  VmBackup,
  VmDisasterRecovery,
  VmExport,
  VmLiveProtect,
  VmMigration,
  VmReplicationGroup,
  VmwareCloneRequest,
  VmwareSnapshotRequest,
  VpnTunnellingCharges,
  WebsiteMonitoring,
  WelcomeKit,
  WindowsEnterpriseAnonymous,
  WindowsEnterpriseAuthenticated,
  WindowsEnterprisePerUser,
  WindowsStandardAnonymous,
  WindowsStandardAuthenticated,
  WindowsStandardPerUser,
  WindowsAdvancedServer,
  WindowsOemServer,
  WindowsProvisioningServer,
  WindowsServer,
  WindowsServerAppliance,
  WindowsTerminalServer,
  WindowsTerminalServicesPerUser
}

export class ProductLocationStatusSerialization
  extends McsEnumSerializationBase<ProductType> {
  constructor() { super(ProductType); }
}
