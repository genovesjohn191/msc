import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class DataChangeJobsEvent extends EventBusState<McsJob[]> {
  constructor() {
    super('DataChangeJobssEvent');
  }
}
