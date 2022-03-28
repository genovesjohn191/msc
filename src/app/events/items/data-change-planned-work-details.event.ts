import { EventBusState } from '@app/event-bus';
import { McsPlannedWork } from '@app/models';

export class DataChangePlannedWorkDetailsEvent extends EventBusState<McsPlannedWork> {
  constructor() {
    super('DataChangePlannedWorkDetailsEvent');
  }
}
