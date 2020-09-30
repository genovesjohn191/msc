import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsLicense } from '@app/models';

export class ServerRequestPatchSelectedEvent extends EventBusState<McsLicense> {
  constructor() {
    super('ServerRequestPatchSelectedEvent');
  }
}
