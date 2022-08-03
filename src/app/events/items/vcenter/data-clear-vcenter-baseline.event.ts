import { EventBusState } from '@app/event-bus';

export class DataClearVCenterBaselineEvent extends EventBusState<void> {
  constructor() {
    super('DataClearVCenterBaselineEvent');
  }
}
