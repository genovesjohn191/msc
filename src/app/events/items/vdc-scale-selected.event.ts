import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsResource } from '@app/models';

export class VdcScaleSelectedEvent extends EventBusState<McsResource> {
  constructor() {
    super('VdcScaleSelectedEvent');
  }
}
