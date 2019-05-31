import { EventBusState } from '@app/event-bus';
import { McsCompany } from '@app/models';

export class AccountChangeEvent extends EventBusState<McsCompany> {
  constructor() {
    super('AccountChange');
  }
}
