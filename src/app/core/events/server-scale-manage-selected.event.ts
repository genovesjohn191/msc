import { EventBusState } from '@app/event-bus';

export class ServerScaleManageSelectedEvent extends EventBusState<string> {
  constructor() {
    super('ServerScaleSelected');
  }
}
