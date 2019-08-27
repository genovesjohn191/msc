import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsCompany } from '@app/models';

export class AccountChangeEvent extends EventBusState<McsCompany> {
  constructor() {
    super('AccountChange');
  }
}
