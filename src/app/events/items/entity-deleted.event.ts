import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityDeletedEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityDeletedEvent');
  }
}
