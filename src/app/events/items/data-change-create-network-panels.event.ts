import { EventBusState } from '@app/event-bus';

export class DataChangeCreateNetworkPanelsEvent extends EventBusState<void> {
  constructor() {
    super('DataChangeCreateNetworkPanelsEvent');
  }
}
