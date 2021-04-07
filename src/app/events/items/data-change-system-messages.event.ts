import { EventBusState } from '@app/event-bus';
import { McsSystemMessage } from '@app/models';

export class DataChangeSystemMessagesEvent extends EventBusState<McsSystemMessage[]> {
  constructor() {
    super('DataChangeSystemMessagesEvent');
  }
}
