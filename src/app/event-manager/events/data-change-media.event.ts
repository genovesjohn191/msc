import { EventBusState } from '@app/event-bus';
import { McsResourceMedia } from '@app/models';

export class DataChangeMediaEvent extends EventBusState<McsResourceMedia[]> {
  constructor() {
    super('DataChangeMediaEvent');
  }
}
