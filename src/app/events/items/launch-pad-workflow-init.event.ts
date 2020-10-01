import { WorkflowGroupConfig } from '@app/features/launch-pad/core/workflows/workflow-group.interface';
import { EventBusState } from '@peerlancers/ngx-event-bus';

export class LaunchPadWorkflowInitEvent extends EventBusState<WorkflowGroupConfig> {
  constructor() {
    super('LaunchPadWorkflowInitEvent');
  }
}
