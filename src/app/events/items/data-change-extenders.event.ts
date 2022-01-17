import { EventBusState } from '@app/event-bus';
import { McsExtenderService } from '@app/models';

export class DataChangeExtendersEvent extends EventBusState<McsExtenderService[]> {
  constructor() {
    super('DataChangeExtendersEvent');
  }
}
