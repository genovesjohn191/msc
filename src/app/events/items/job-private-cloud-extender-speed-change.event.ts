import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobPrivateCloudExtenderSpeedChangeEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobPrivateCloudExtenderSpeedChangeEvent');
  }
}
