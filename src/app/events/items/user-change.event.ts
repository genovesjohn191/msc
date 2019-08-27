import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsIdentity } from '@app/models';

export class UserChangeEvent extends EventBusState<McsIdentity> {
  constructor() {
    super('UserChange');
  }
}
