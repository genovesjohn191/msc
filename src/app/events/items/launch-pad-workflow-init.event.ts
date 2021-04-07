import { EventBusState } from '@app/event-bus';
import { WorkflowGroupConfig } from '@app/features/launch-pad/core/workflows/workflow-group.interface';

export class LaunchPadWorkflowInitEvent extends EventBusState<WorkflowGroupConfig> {
  constructor() {
    super('LaunchPadWorkflowInitEvent');
  }
}
