import { EventBusState } from '@app/event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityUpdatedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityUpdatedEvent');
  }
}
