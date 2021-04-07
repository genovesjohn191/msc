import { EventBusState } from '@app/event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityCreatedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityCreatedEvent');
  }
}
