import { EventBusState } from '@peerlancers/ngx-event-bus';
import { LaunchPadSetting } from '@app/features/launch-pad/core/workflow-selector.service';

export class LaunchPadWorkflowInitEvent extends EventBusState<LaunchPadSetting> {
  constructor() {
    super('LaunchPadWorkflowInitEvent');
  }
}
