import { EventBusState } from '@app/event-bus';
import { WorkflowGroupConfig } from '@app/features/launch-pad/workflows/workflow/core/workflow-group.interface';

export class LaunchPadWorkflowInitEvent extends EventBusState<WorkflowGroupConfig> {
  constructor() {
    super('LaunchPadWorkflowInitEvent');
  }
}
