import { EventBusState } from '@app/event-bus';
import { McsNotice } from '@app/models';

export class DataChangeNoticesEvent extends EventBusState<McsNotice[]> {
  constructor() {
    super('DataChangeNoticesEvent');
  }
}
