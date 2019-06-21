import { EventBusState } from '@app/event-bus';
import { McsConsole } from '@app/models';

export class DataChangeConsoleEvent extends EventBusState<McsConsole[]> {
  constructor() {
    super('DataChangeConsoleEvent');
  }
}
