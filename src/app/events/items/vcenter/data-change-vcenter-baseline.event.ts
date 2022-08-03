import { EventBusState } from '@app/event-bus';
import { McsVCenterBaseline } from '@app/models';

export class DataChangeVCenterBaselineEvent extends EventBusState<McsVCenterBaseline[]> {
  constructor() {
    super('DataChangeVCenterBaselineEvent');
  }
}
