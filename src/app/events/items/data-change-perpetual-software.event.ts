import { EventBusState } from '@app/event-bus';
import { McsPerpetualSoftware } from '@app/models';

export class DataChangePerpetualSoftwareEvent extends EventBusState<McsPerpetualSoftware[]> {
  constructor() {
    super('DataChangePerpetualSoftwareEvent');
  }
}