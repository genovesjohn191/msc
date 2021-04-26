import { EventBusState } from '@app/event-bus';
import { McsStateNotification } from '@app/models';

export class StateNotificationShowEvent extends EventBusState<McsStateNotification> {
  constructor() {
    super('StateNotificationShowEvent');
  }
}
