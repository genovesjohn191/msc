import { EventBusState } from '@app/event-bus';
import { McsNetworkDbNetwork } from '@app/models';

export class DataChangeNetworkDbNetworksEvent extends EventBusState<McsNetworkDbNetwork[]> {
  constructor() {
    super('DataChangeNetworkDbNetworksEvent');
  }
}
