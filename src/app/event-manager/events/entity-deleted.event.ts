import { EventBusState } from '@app/event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityDeletedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityDeletedEvent');
  }
}
