import { EventBusState } from '@app/event-bus';
import { McsSystemMessageCreate } from '@app/models';

export class SystemMessageValidateEvent extends EventBusState<McsSystemMessageCreate> {
  constructor() {
    super('SystemMessageValidateEvent');
  }
}
