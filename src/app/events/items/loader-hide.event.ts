import { EventBusState } from '@peerlancers/ngx-event-bus';

export class LoaderHideEvent extends EventBusState<void> {
  constructor() {
    super('LoaderHideEvent');
  }
}
