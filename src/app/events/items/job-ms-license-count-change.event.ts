import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobMsLicenseCountChangeEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobMsLicenseCountChangeEvent');
  }
}