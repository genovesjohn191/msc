import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityClearStateEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityClearStateEvent');
  }
}
