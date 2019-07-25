import { EventBusState } from '@app/event-bus';
import { McsSystemMessageEdit } from '@app/models';

export class SystemMessageEditEvent extends EventBusState<McsSystemMessageEdit> {
  constructor() {
    super('SystemMessageEditEvent');
  }
}
