import { EventBusState } from '@peerlancers/ngx-event-bus';

export class LoaderShowEvent extends EventBusState<string> {
  constructor() {
    super('LoaderShowEvent');
  }
}
