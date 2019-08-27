import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsEntityRequester } from '@app/models';

export class EntityActiveEvent extends EventBusState<McsEntityRequester> {
  constructor() {
    super('EntityActiveEvent');
  }
}
