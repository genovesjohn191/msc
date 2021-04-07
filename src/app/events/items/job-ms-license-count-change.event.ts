import { EventBusState } from '@app/event-bus';
import { McsJob } from '@app/models';

export class JobMsLicenseCountChangeEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobMsLicenseCountChangeEvent');
  }
}
