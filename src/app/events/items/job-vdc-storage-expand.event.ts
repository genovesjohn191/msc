import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobVdcStorageExpandEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobVdcStorageExpandEvent');
  }
}
