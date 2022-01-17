import { AccountChangeEvent } from './items/account-change.event';
import { DataChangeAggregationTargetsEvent } from './items/data-change-aggregation-targets-event';
import { DataChangeAzureManagedServicesEvent } from './items/data-change-azure-managed-services.event';
import { DataChangeAzureManagementServicesEvent } from './items/data-change-azure-management-services.event';
import { DataChangeExtendersEvent } from './items/data-change-extenders.event';
import { DataChangeApplicationRecoveryEvent } from './items/data-change-application-recovery.event';
import { DataChangeAzureReservationsEvent } from './items/data-change-azure-reservations.event';
import { DataChangeAzureResourcesEvent } from './items/data-change-azure-resources.event';
import { DataChangeAzureSoftwareSubscriptionsEvent } from './items/data-change-azure-software-subscriptions.event';
import { DataChangeCompaniesEvent } from './items/data-change-companies.event';
import { DataChangeConsoleEvent } from './items/data-change-console.event';
import { DnsDetailsChangeEvent } from './items/data-change-dns-details.event';
import { DnsListingEvent } from './items/data-change-dns-listing.event';
import { DataChangeFirewallsEvent } from './items/data-change-firewalls.event';
import { DataChangeInternetPortsEvent } from './items/data-change-internet-ports.event';
import { DataChangeJobsEvent } from './items/data-change-jobs.event';
import { DataChangeLicensesEvent } from './items/data-change-licenses.event';
import { DataChangeMediaEvent } from './items/data-change-media.event';
import { DataChangeNetworkDbNetworksEvent } from './items/data-change-networks.event';
import { DataChangeOrdersEvent } from './items/data-change-orders.event';
import { DataChangeResourcesEvent } from './items/data-change-resources.event';
import { DataChangeServersEvent } from './items/data-change-servers.event';
import { DataChangeSystemMessagesEvent } from './items/data-change-system-messages.event';
import { DataChangeTerraformDeploymentsEvent } from './items/data-change-terraform-deployments.event';
import { DataChangeTicketsEvent } from './items/data-change-tickets.event';
import { DataChangeToolsEvent } from './items/data-change-tools.event';
import { DataClearMediaEvent } from './items/data-clear-media.event';
import { DataClearServersEvent } from './items/data-clear-servers.event';
import { DataClearSystemMessageEvent } from './items/data-clear-system-messages.event';
import { DataClearTerraformDeploymentsEvent } from './items/data-clear-terraform-deployments.event';
import { EntityActiveEvent } from './items/entity-active.event';
import { EntityClearStateEvent } from './items/entity-clear-state.event';
import { EntityCreatedEvent } from './items/entity-created.event';
import { EntityDeletedEvent } from './items/entity-deleted.event';
import { EntityUpdatedEvent } from './items/entity-updated.event';
import { ErrorShowEvent } from './items/error-show.event';
import { InternetChangePortPlanSelectedEvent } from './items/internet-change-port-plan-selected.event';
import { JobBackupAggregationTargetAddEvent } from './items/job-backup-aggregation-target-add.event';
import { JobCurrentUserEvent } from './items/job-current-user.event';
import { JobErrorEvent } from './items/job-error.event';
import { JobInProgressEvent } from './items/job-in-progress.event';
import { JobInternetChangePortPlanEvent } from './items/job-internet-change-port-plan.event';
import { JobMsLicenseCountChangeEvent } from './items/job-ms-license-count-change.event';
import { JobNetworkDbNetworkCreateEvent } from './items/job-network-db-network-create.event';
import { JobNetworkDbNetworkDeleteEvent } from './items/job-network-db-network-delete.event';
import { JobReceiveEvent } from './items/job-receive.event';
import { JobResourceCatalogItemCreateEvent } from './items/job-resource-catalog-item-create.event';
import { JobServerAvAddEvent } from './items/job-server-av-add.event';
import { JobServerBackupServerAddEvent } from './items/job-server-backup-server-add.event';
import { JobServerBackupVmAddEvent } from './items/job-server-backup-vm-add.event';
import { JobServerChangePowerStateEvent } from './items/job-server-change-powerstate.event';
import { JobServerCloneEvent } from './items/job-server-clone.event';
import { JobServerComputeUpdateEvent } from './items/job-server-compute-update.event';
import { JobServerCreateEvent } from './items/job-server-create.event';
import { JobServerDeleteEvent } from './items/job-server-delete.event';
import { JobServerDiskCreateEvent } from './items/job-server-disk-create.event';
import { JobServerDiskDeleteEvent } from './items/job-server-disk-delete.event';
import { JobServerDiskUpdateEvent } from './items/job-server-disk-update.event';
import { JobServerHidsAddEvent } from './items/job-server-hids-add.event';
import { JobServerManagedRaiseInviewLevelEvent } from './items/job-server-managed-raise-inview-level.event';
import { JobServerManagedScaleEvent } from './items/job-server-managed-scale.event';
import { JobServerMediaAttachEvent } from './items/job-server-media-attach.event';
import { JobServerMediaDetachEvent } from './items/job-server-media-detach.event';
import { JobServerNicCreateEvent } from './items/job-server-nic-create.event';
import { JobServerNicDeleteEvent } from './items/job-server-nic-delete.event';
import { JobServerNicUpdateEvent } from './items/job-server-nic-update.event';
import { JobServerOsUpdateApplyEvent } from './items/job-server-os-update-apply.event';
import { JobServerOsUpdateInspectEvent } from './items/job-server-os-update-inspect.event';
import { JobServerRenameEvent } from './items/job-server-rename.event';
import { JobServerResetPasswordEvent } from './items/job-server-reset-password.event';
import { JobServerSnapshotApplyEvent } from './items/job-server-snapshot-apply.event';
import { JobServerSnapshotCreateEvent } from './items/job-server-snapshot-create.event';
import { JobServerSnapshotDeleteEvent } from './items/job-server-snapshot-delete.event';
import { JobSuccessfulEvent } from './items/job-successful.event';
import { JobTerraformCreateApplyEvent } from './items/job-terraform-create-apply.event';
import { JobTerraformCreateDeleteEvent } from './items/job-terraform-create-delete.event';
import { JobTerraformCreateDestroyEvent } from './items/job-terraform-create-destroy.event';
import { JobTerraformCreatePlanEvent } from './items/job-terraform-create-plan.event';
import { JobVdcScaleEvent } from './items/job-vdc-scale.event';
import { JobVdcStorageExpandEvent } from './items/job-vdc-storage-expand.event';
import { LaunchPadWorkflowInitEvent } from './items/launch-pad-workflow-init.event';
import { LicenseCountChangeSelectedEvent } from './items/license-count-change-selected.event';
import { LoaderHideEvent } from './items/loader-hide.event';
import { LoaderShowEvent } from './items/loader-show.event';
import { NavToggleEvent } from './items/nav-toggle-event';
import { NewRecordsRetrievedEvent } from './items/new-records-retrieved.event';
import { PdfDownloadEvent } from './items/pdf-download.event';
import { RouteChangeEvent } from './items/route-change.event';
import { ServerAddAvSelectedEvent } from './items/server-add-av-selected.event';
import { ServerAddBackupServerSelectedEvent } from './items/server-add-backup-server-selected.event';
import { ServerAddBackupVmSelectedEvent } from './items/server-add-backup-vm-selected.event';
import { ServerAddHidsSelectedEvent } from './items/server-add-hids-selected.event';
import { ServerManagedRaiseInviewSelectedEvent } from './items/server-raise-inview-selected.event';
import { ServerRequestPatchSelectedEvent } from './items/server-request-patch-selected.event';
import { ServiceRequestChangeSelectedEvent } from './items/service-request-change-selected.event';
import { SessionTimedOutEvent } from './items/session-timedout.event';
import { StateNotificationShowEvent } from './items/state-notification-show.event';
import { SystemMessageHideEvent } from './items/system-message-hide.event';
import { SystemMessageShowEvent } from './items/system-message-show.event';
import { UserChangeEvent } from './items/user-change.event';
import { VdcScaleSelectedEvent } from './items/vdc-scale-selected.event';
import { VdcStorageExpandSelectedEvent } from './items/vdc-storage-expand-selected.event';

export class McsEvent {
  public static routeChange = new RouteChangeEvent();
  public static navToggle = new NavToggleEvent();
  public static accountChange = new AccountChangeEvent();
  public static userChange = new UserChangeEvent();
  public static sessionTimedOut = new SessionTimedOutEvent();
  public static serverRaiseInviewSelected = new ServerManagedRaiseInviewSelectedEvent();
  public static serverAddAvSelected = new ServerAddAvSelectedEvent();
  public static serverAddHidsSelected = new ServerAddHidsSelectedEvent();
  public static serverAddBackupServerSelected = new ServerAddBackupServerSelectedEvent();
  public static serverAddBackupVmSelected = new ServerAddBackupVmSelectedEvent();
  public static licenseCountChangeSelectedEvent = new LicenseCountChangeSelectedEvent();
  public static serviceRequestChangeSelectedEvent = new ServiceRequestChangeSelectedEvent();
  public static serverRequestPatchSelectedEvent = new ServerRequestPatchSelectedEvent();
  public static vdcScaleSelectedEvent = new VdcScaleSelectedEvent();
  public static vdcStorageExpandSelectedEvent = new VdcStorageExpandSelectedEvent();
  public static internetChangePortPlanSelectedEvent = new InternetChangePortPlanSelectedEvent();
  public static loaderShow = new LoaderShowEvent();
  public static loaderHide = new LoaderHideEvent();
  public static errorShow = new ErrorShowEvent();
  public static stateNotificationShow = new StateNotificationShowEvent();
  public static systemMessageShow = new SystemMessageShowEvent();
  public static systemMessageHide = new SystemMessageHideEvent();

  public static pdfDownloadEvent = new PdfDownloadEvent();

  public static entityActiveEvent = new EntityActiveEvent();
  public static entityClearStateEvent = new EntityClearStateEvent();
  public static entityUpdatedEvent = new EntityUpdatedEvent();
  public static entityCreatedEvent = new EntityCreatedEvent();
  public static entityDeletedEvent = new EntityDeletedEvent();

  public static dataAllRecordsUpdated = new NewRecordsRetrievedEvent();
  public static dataChangeServers = new DataChangeServersEvent();
  public static dataChangeResources = new DataChangeResourcesEvent();
  public static dataChangeTools = new DataChangeToolsEvent();
  public static dataChangeCompanies = new DataChangeCompaniesEvent();
  public static dataChangeConsole = new DataChangeConsoleEvent();
  public static dataChangeFirewalls = new DataChangeFirewallsEvent();
  public static dataChangeLicenses = new DataChangeLicensesEvent();
  public static dataChangeMedia = new DataChangeMediaEvent();
  public static dataChangeOrders = new DataChangeOrdersEvent();
  public static dataChangeSystemMessages = new DataChangeSystemMessagesEvent();
  public static dataChangeTickets = new DataChangeTicketsEvent();
  public static dataChangeJobs = new DataChangeJobsEvent();
  public static dataChangeInternetPorts = new DataChangeInternetPortsEvent();
  public static dataChangeAggregationTargets = new DataChangeAggregationTargetsEvent();
  public static dataChangeAzureResources = new DataChangeAzureResourcesEvent();
  public static dataChangeAzureManagedServices = new DataChangeAzureManagedServicesEvent();
  public static dataChangeAzureManagementServices = new DataChangeAzureManagementServicesEvent();
  public static dataChangeExtenders = new DataChangeExtendersEvent();
  public static dataChangeApplicationRecovery = new DataChangeApplicationRecoveryEvent();
  public static dataChangeAzureReservations = new DataChangeAzureReservationsEvent();
  public static dataChangeAzureSoftwareSubscriptions = new DataChangeAzureSoftwareSubscriptionsEvent();
  public static dataChangeDnsListing = new DnsListingEvent();
  public static dataChangeDnsDetails = new DnsDetailsChangeEvent();
  public static dataChangeTerraformDeployments = new DataChangeTerraformDeploymentsEvent();
  public static dataChangeNetworkDbNetworksEvent = new DataChangeNetworkDbNetworksEvent();

  public static dataClearServers = new DataClearServersEvent();
  public static dataClearMedia = new DataClearMediaEvent();
  public static dataClearSystemMessage = new DataClearSystemMessageEvent();
  public static dataClearTerraformDeployments = new DataClearTerraformDeploymentsEvent();

  public static jobCurrentUser = new JobCurrentUserEvent();
  public static jobReceive = new JobReceiveEvent();
  public static jobError = new JobErrorEvent();
  public static jobSuccessful = new JobSuccessfulEvent();
  public static jobInProgress = new JobInProgressEvent();
  public static jobServerMediaAttach = new JobServerMediaAttachEvent();
  public static jobServerMediaDetach = new JobServerMediaDetachEvent();
  public static jobServerComputeUpdate = new JobServerComputeUpdateEvent();
  public static jobServerDiskCreate = new JobServerDiskCreateEvent();
  public static jobServerDiskUpdate = new JobServerDiskUpdateEvent();
  public static jobServerDiskDelete = new JobServerDiskDeleteEvent();
  public static jobServerNicCreate = new JobServerNicCreateEvent();
  public static jobServerNicUpdate = new JobServerNicUpdateEvent();
  public static jobServerNicDelete = new JobServerNicDeleteEvent();
  public static jobServerSnapshotCreate = new JobServerSnapshotCreateEvent();
  public static jobServerSnapshotApply = new JobServerSnapshotApplyEvent();
  public static jobServerSnapshotDelete = new JobServerSnapshotDeleteEvent();
  public static jobServerOsUpdateApply = new JobServerOsUpdateApplyEvent();
  public static jobServerOsUpdateInspect = new JobServerOsUpdateInspectEvent();
  public static jobServerCreate = new JobServerCreateEvent();
  public static jobServerClone = new JobServerCloneEvent();
  public static jobServerRename = new JobServerRenameEvent();
  public static jobServerDelete = new JobServerDeleteEvent();
  public static jobServerChangePowerState = new JobServerChangePowerStateEvent();
  public static jobServerResetPassword = new JobServerResetPasswordEvent();
  public static jobServerManagedScaleEvent = new JobServerManagedScaleEvent();
  public static jobServerManagedRaiseInviewLevelEvent = new JobServerManagedRaiseInviewLevelEvent();
  public static jobServerAvAddEvent = new JobServerAvAddEvent();
  public static jobServerHidsAddEvent = new JobServerHidsAddEvent();
  public static jobServerBackupServerAddEvent = new JobServerBackupServerAddEvent();
  public static jobServerBackupVmAddEvent = new JobServerBackupVmAddEvent();

  public static jobTerraformCreatePlanEvent = new JobTerraformCreatePlanEvent();
  public static jobTerraformCreateApplyEvent = new JobTerraformCreateApplyEvent();
  public static jobTerraformCreateDestroyEvent = new JobTerraformCreateDestroyEvent();
  public static jobTerraformCreateDeleteEvent = new JobTerraformCreateDeleteEvent();

  public static jobNetworkDbNetworkCreateEvent = new JobNetworkDbNetworkCreateEvent();
  public static jobNetworkDbNetworkDeleteEvent = new JobNetworkDbNetworkDeleteEvent();

  public static jobBackupAggregationTargetAddEvent = new JobBackupAggregationTargetAddEvent();
  public static jobVdcScaleEvent = new JobVdcScaleEvent();
  public static jobVdcStorageExpandEvent = new JobVdcStorageExpandEvent();
  public static jobResourceCatalogItemCreate = new JobResourceCatalogItemCreateEvent();
  public static jobMsLicenseCountChangeEvent = new JobMsLicenseCountChangeEvent();
  public static jobInternetChangePortPlanEvent = new JobInternetChangePortPlanEvent();
  public static launchPadWorkflowInitEvent = new LaunchPadWorkflowInitEvent();
}
