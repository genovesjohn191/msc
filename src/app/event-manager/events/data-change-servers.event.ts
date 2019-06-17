import { EventBusState } from '@app/event-bus';
import { McsServer } from '@app/models';

export class DataChangeServersEvent extends EventBusState<McsServer[]> {
  constructor() {
    super('DataChangeServersEvent');
  }
}
