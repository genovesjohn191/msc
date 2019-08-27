import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsResource } from '@app/models';

export class DataChangeResourcesEvent extends EventBusState<McsResource[]> {
  constructor() {
    super('DataChangeResourcesEvent');
  }
}
