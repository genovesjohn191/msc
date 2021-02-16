import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsJob } from '@app/models';

export class JobInternetChangePortPlanEvent extends EventBusState<McsJob> {
  constructor() {
    super('JobInternetChangePortPlanEvent');
  }
}