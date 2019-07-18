import { RouteChangeEvent } from './events/route-change.event';
import { AccountChangeEvent } from './events/account-change.event';
import { UserChangeEvent } from './events/user-change.event';
import { SessionTimedOutEvent } from './events/session-timedout.event';
import { ServerScaleManageSelectedEvent } from './events/server-scale-manage-selected.event';
import { ProductSelectedEvent } from './events/product-selected.event';
import { ProductUnSelectedEvent } from './events/product-unselected.event';
import { OrderStateBusyEvent } from './events/order-state-busy.event';
import { OrderStateEndedEvent } from './events/order-state-ended.event';
import { LoaderShowEvent } from './events/loader-show.event';
import { LoaderHideEvent } from './events/loader-hide.event';
import { ErrorShowEvent } from './events/error-show.event';

import { DataChangeProductCatalogEvent } from './events/data-change-product-catalog.event';
import { DataChangeServersEvent } from './events/data-change-servers.event';
import { DataChangeResourcesEvent } from './events/data-change-resources.event';
import { DataChangeToolsEvent } from './events/data-change-tools.event';
import { DataChangeTicketsEvent } from './events/data-change-tickets.event';
import { DataChangeSystemMessagesEvent } from './events/data-change-system-messages.event';
import { DataChangeProductsEvent } from './events/data-change-products.event';
import { DataChangeOrdersEvent } from './events/data-change-orders.event';
import { DataChangeMediaEvent } from './events/data-change-media.event';
import { DataChangeFirewallsEvent } from './events/data-change-firewalls.event';
import { DataChangeConsoleEvent } from './events/data-change-console.event';
import { DataChangeCompaniesEvent } from './events/data-change-companies.event';
import { DataChangeJobsEvent } from './events/data-change-jobs.event';
import { DataChangeInternetPortsEvent } from './events/data-change-internet-ports.event';

import { DataClearServersEvent } from './events/data-clear-servers.event';
import { DataClearMediaEvent } from './events/data-clear-media.event';

import { JobServerDiskCreateEvent } from './events/job-server-disk-create.event';
import { JobServerDiskUpdateEvent } from './events/job-server-disk-update.event';
import { JobServerDiskDeleteEvent } from './events/job-server-disk-delete.event';
import { JobServerNicCreateEvent } from './events/job-server-nic-create.event';
import { JobServerNicUpdateEvent } from './events/job-server-nic-update.event';
import { JobServerNicDeleteEvent } from './events/job-server-nic-delete.event';
import { JobServerMediaAttachEvent } from './events/job-server-media-attach.event';
import { JobServerMediaDetachEvent } from './events/job-server-media-detach.event';
import { JobServerComputeUpdateEvent } from './events/job-server-compute-update.event';
import { JobServerSnapshotDeleteEvent } from './events/job-server-snapshot-delete.event';
import { JobServerSnapshotApplyEvent } from './events/job-server-snapshot-apply.event';
import { JobServerSnapshotCreateEvent } from './events/job-server-snapshot-create.event';
import { JobServerOsUpdateApplyEvent } from './events/job-server-os-update-apply.event';
import { JobServerOsUpdateInspectEvent } from './events/job-server-os-update-inspect.event';
import { JobServerCreateEvent } from './events/job-server-create.event';
import { JobServerCloneEvent } from './events/job-server-clone.event';
import { JobServerRenameEvent } from './events/job-server-rename.event';
import { JobServerDeleteEvent } from './events/job-server-delete.event';
import { JobServerChangePowerStateEvent } from './events/job-server-change-powerstate.event';
import { JobServerResetPasswordEvent } from './events/job-server-reset-password.event';
import { JobErrorEvent } from './events/job-error.event';
import { JobSuccessfulEvent } from './events/job-successful.event';
import { JobInProgressEvent } from './events/job-in-progress.event';
import { JobReceiveEvent } from './events/job-receive.event';
import { JobCurrentUserEvent } from './events/job-current-user.event';
import { JobResourceCatalogItemCreateEvent } from './events/job-resource-catalog-item-create.event';
import { JobOrderScaleManagedServerEvent } from './events/job-order-scale-managed-server.event';
import { SystemMessageCreateEvent } from './events/system-message-create.event';
import { SystemMessageValidateEvent } from './events/system-message-validate.event';
import { TicketCreateEvent } from './events/ticket-create.event';

export class McsEvent {
  public static routeChange = new RouteChangeEvent();
  public static accountChange = new AccountChangeEvent();
  public static userChange = new UserChangeEvent();
  public static sessionTimedOut = new SessionTimedOutEvent();
  public static serverScaleManageSelected = new ServerScaleManageSelectedEvent();
  public static productSelected = new ProductSelectedEvent();
  public static productUnSelected = new ProductUnSelectedEvent();
  public static loaderShow = new LoaderShowEvent();
  public static loaderHide = new LoaderHideEvent();
  public static errorShow = new ErrorShowEvent();

  public static orderStateBusy = new OrderStateBusyEvent();
  public static orderStateEnded = new OrderStateEndedEvent();

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
  public static jobResourceCatalogItemCreate = new JobResourceCatalogItemCreateEvent();
  public static jobOrderScaleManagedServer = new JobOrderScaleManagedServerEvent();

  public static systemMessageCreated = new SystemMessageCreateEvent();
  public static systemMessageValidated = new SystemMessageValidateEvent();

  public static ticketCreateEvent = new TicketCreateEvent();
}
