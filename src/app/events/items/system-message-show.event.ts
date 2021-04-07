import { EventBusState } from '@app/event-bus';
import { McsSystemMessage } from '@app/models';

export class SystemMessageShowEvent extends EventBusState<McsSystemMessage> {
  constructor() {
    super('SystemMessageShowEvent');
  }
}
