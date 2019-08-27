import { RouteChangeEvent } from './items/route-change.event';
import { AccountChangeEvent } from './items/account-change.event';
import { UserChangeEvent } from './items/user-change.event';
import { SessionTimedOutEvent } from './items/session-timedout.event';
import { ServerManagedScaleSelectedEvent } from './items/server-scale-manage-selected.event';
import { ServerManagedRaiseInviewSelectedEvent } from './items/server-raise-inview-selected.event';
import { ProductSelectedEvent } from './items/product-selected.event';
import { ProductUnSelectedEvent } from './items/product-unselected.event';
import { LoaderShowEvent } from './items/loader-show.event';
import { LoaderHideEvent } from './items/loader-hide.event';
import { ErrorShowEvent } from './items/error-show.event';

import { EntityActiveEvent } from './items/entity-active.event';
import { EntityClearStateEvent } from './items/entity-clear-state.event';
import { EntityCreatedEvent } from './items/entity-created.event';
import { EntityDeletedEvent } from './items/entity-deleted.event';
import { EntityUpdatedEvent } from './items/entity-updated.event';

import { DataChangeProductCatalogEvent } from './items/data-change-product-catalog.event';
import { DataChangeServersEvent } from './items/data-change-servers.event';
import { DataChangeResourcesEvent } from './items/data-change-resources.event';
import { DataChangeToolsEvent } from './items/data-change-tools.event';
import { DataChangeTicketsEvent } from './items/data-change-tickets.event';
import { DataChangeSystemMessagesEvent } from './items/data-change-system-messages.event';
import { DataChangeProductsEvent } from './items/data-change-products.event';
import { DataChangeOrdersEvent } from './items/data-change-orders.event';
import { DataChangeMediaEvent } from './items/data-change-media.event';
import { DataChangeFirewallsEvent } from './items/data-change-firewalls.event';
import { DataChangeConsoleEvent } from './items/data-change-console.event';
import { DataChangeCompaniesEvent } from './items/data-change-companies.event';
import { DataChangeJobsEvent } from './items/data-change-jobs.event';
import { DataChangeInternetPortsEvent } from './items/data-change-internet-ports.event';

import { DataClearServersEvent } from './items/data-clear-servers.event';
import { DataClearMediaEvent } from './items/data-clear-media.event';

import { JobServerDiskCreateEvent } from './items/job-server-disk-create.event';
import { JobServerDiskUpdateEvent } from './items/job-server-disk-update.event';
import { JobServerDiskDeleteEvent } from './items/job-server-disk-delete.event';
import { JobServerNicCreateEvent } from './items/job-server-nic-create.event';
import { JobServerNicUpdateEvent } from './items/job-server-nic-update.event';
import { JobServerNicDeleteEvent } from './items/job-server-nic-delete.event';
import { JobServerMediaAttachEvent } from './items/job-server-media-attach.event';
import { JobServerMediaDetachEvent } from './items/job-server-media-detach.event';
import { JobServerComputeUpdateEvent } from './items/job-server-compute-update.event';
import { JobServerSnapshotDeleteEvent } from './items/job-server-snapshot-delete.event';
import { JobServerSnapshotApplyEvent } from './items/job-server-snapshot-apply.event';
import { JobServerSnapshotCreateEvent } from './items/job-server-snapshot-create.event';
import { JobServerOsUpdateApplyEvent } from './items/job-server-os-update-apply.event';
import { JobServerOsUpdateInspectEvent } from './items/job-server-os-update-inspect.event';
import { JobServerCreateEvent } from './items/job-server-create.event';
import { JobServerCloneEvent } from './items/job-server-clone.event';
import { JobServerRenameEvent } from './items/job-server-rename.event';
import { JobServerDeleteEvent } from './items/job-server-delete.event';
import { JobServerChangePowerStateEvent } from './items/job-server-change-powerstate.event';
import { JobServerResetPasswordEvent } from './items/job-server-reset-password.event';
import { JobServerManagedScaleEvent } from './items/job-server-managed-scale.event';
import { JobServerManagedRaiseInviewLevelEvent } from './items/job-server-managed-raise-inview-level.event';
import { JobErrorEvent } from './items/job-error.event';
import { JobSuccessfulEvent } from './items/job-successful.event';
import { JobInProgressEvent } from './items/job-in-progress.event';
import { JobReceiveEvent } from './items/job-receive.event';
import { JobCurrentUserEvent } from './items/job-current-user.event';
import { JobResourceCatalogItemCreateEvent } from './items/job-resource-catalog-item-create.event';

export class McsEvent {
  public static routeChange = new RouteChangeEvent();
  public static accountChange = new AccountChangeEvent();
  public static userChange = new UserChangeEvent();
  public static sessionTimedOut = new SessionTimedOutEvent();
  public static serverScaleManageSelected = new ServerManagedScaleSelectedEvent();
  public static serverRaiseInviewSelected = new ServerManagedRaiseInviewSelectedEvent();
  public static productSelected = new ProductSelectedEvent();
  public static productUnSelected = new ProductUnSelectedEvent();
  public static loaderShow = new LoaderShowEvent();
  public static loaderHide = new LoaderHideEvent();
  public static errorShow = new ErrorShowEvent();

  public static entityActiveEvent = new EntityActiveEvent();
  public static entityClearStateEvent = new EntityClearStateEvent();
  public static entityUpdatedEvent = new EntityUpdatedEvent();
  public static entityCreatedEvent = new EntityCreatedEvent();
  public static entityDeletedEvent = new EntityDeletedEvent();

  public static dataChangeProductCatalog = new DataChangeProductCatalogEvent();
  public static dataChangeServers = new DataChangeServersEvent();
  public static dataChangeResources = new DataChangeResourcesEvent();
  public static dataChangeTools = new DataChangeToolsEvent();
  public static dataChangeCompanies = new DataChangeCompaniesEvent();
  public static dataChangeConsole = new DataChangeConsoleEvent();
  public static dataChangeFirewalls = new DataChangeFirewallsEvent();
  public static dataChangeMedia = new DataChangeMediaEvent();
  public static dataChangeOrders = new DataChangeOrdersEvent();
  public static dataChangeProducts = new DataChangeProductsEvent();
  public static dataChangeSystemMessages = new DataChangeSystemMessagesEvent();
  public static dataChangeTickets = new DataChangeTicketsEvent();
  public static dataChangeJobs = new DataChangeJobsEvent();
  public static dataChangeInternetPorts = new DataChangeInternetPortsEvent();

  public static dataClearServers = new DataClearServersEvent();
  public static dataClearMedia = new DataClearMediaEvent();

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
  public static jobResourceCatalogItemCreate = new JobResourceCatalogItemCreateEvent();
}
