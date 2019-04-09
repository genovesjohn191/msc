import { RouteChangeEvent } from './events/route-change.event';
import { AccountChangeEvent } from './events/account-change.event';
import { UserChangeEvent } from './events/user-change.event';
import { SessionTimedOutEvent } from './events/session-timedout.event';
import { ProductSelectedEvent } from './events/product-selected.event';
import { ProductUnSelectedEvent } from './events/product-unselected.event';
import { OrderStateBusyEvent } from './events/order-state-busy.event';
import { OrderStateEndedEvent } from './events/order-state-ended.event';
import { LoaderShowEvent } from './events/loader-show.event';
import { LoaderHideEvent } from './events/loader-hide.event';

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

export class CoreEvent {
  public static routeChange = new RouteChangeEvent();
  public static accountChange = new AccountChangeEvent();
  public static userChange = new UserChangeEvent();
  public static sessionTimedOut = new SessionTimedOutEvent();
  public static productSelected = new ProductSelectedEvent();
  public static productUnSelected = new ProductUnSelectedEvent();
  public static orderStateBusy = new OrderStateBusyEvent();
  public static orderStateEnded = new OrderStateEndedEvent();
  public static loaderShow = new LoaderShowEvent();
  public static loaderHide = new LoaderHideEvent();

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
}
