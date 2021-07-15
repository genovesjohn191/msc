import { Injector } from '@angular/core';
import { McsNetworkDbNetwork } from '@app/models';
import { McsNetworkDbNetworksRepository } from '@app/services/repositories/mcs-network-db-networks.repository';

import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsNetworkDbNetworkStateManager extends McsEntityStateManagerBase<McsNetworkDbNetwork> {

  constructor(_injector: Injector) {
    super(_injector, McsNetworkDbNetworksRepository);
  }
}
