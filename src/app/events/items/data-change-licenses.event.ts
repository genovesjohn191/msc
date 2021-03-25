import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsLicense } from '@app/models';

export class DataChangeLicensesEvent extends EventBusState<McsLicense[]> {
  constructor() {
    super('DataChangeLicensesEvent');
  }
}
