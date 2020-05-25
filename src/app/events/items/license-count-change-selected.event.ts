import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsLicense } from '@app/models';

export class LicenseCountChangeSelectedEvent extends EventBusState<McsLicense> {
  constructor() {
    super('LicenseCountChangeSelectedEvent');
  }
}
