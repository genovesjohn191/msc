import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityUpdatedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityUpdatedEvent');
  }
}
