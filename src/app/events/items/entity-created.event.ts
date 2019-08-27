import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityCreatedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityCreatedEvent');
  }
}
