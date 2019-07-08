import { EventBusState } from '@app/event-bus';
import { McsSystemMessageCreate } from '@app/models';

export class SystemMessageCreateEvent extends EventBusState<McsSystemMessageCreate> {
  constructor() {
    super('SystemMessageCreateEvent');
  }
}
