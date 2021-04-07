import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class DataChangeJobsEvent extends EventBusState<McsJob[]> {
  constructor() {
    super('DataChangeJobssEvent');
  }
}
