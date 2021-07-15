import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsNetworkDbNetwork
} from '@app/models';
import { McsNetworkDbNetworksRepository } from '@app/services/repositories/mcs-network-db-networks.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobNetworkDbNetworkManager extends McsJobEntityBase<McsNetworkDbNetwork> {

  constructor(
    _actionStatus: ActionStatus,
    _injector: Injector,
    private _customJobReferenceId?: string
  ) {
    super(
      EntityRequester.NetworkDbNetwork,
      _injector.get(McsNetworkDbNetworksRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'networkId';
  }
}
