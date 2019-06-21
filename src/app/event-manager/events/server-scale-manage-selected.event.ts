import { EventBusState } from '@app/event-bus';
import { McsServer } from '@app/models';

export class ServerScaleManageSelectedEvent extends EventBusState<McsServer> {
  constructor() {
    super('ServerScaleSelected');
  }
}
