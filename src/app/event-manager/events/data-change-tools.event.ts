import { EventBusState } from '@app/event-bus';
import { McsPortal } from '@app/models';

export class DataChangeToolsEvent extends EventBusState<McsPortal[]> {
  constructor() {
    super('DataChangeToolsEvent');
  }
}
