import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobResourceCatalogItemCreateEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobResourceCatalogItemCreateEvent');
  }
}
