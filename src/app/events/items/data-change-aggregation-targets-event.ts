import { EventBusState } from '@app/event-bus';
import { McsBackUpAggregationTarget } from '@app/models';

export class DataChangeAggregationTargetsEvent extends EventBusState<McsBackUpAggregationTarget[]> {
  constructor() {
    super('DataChangeAggregationTargetsEvent');
  }
}
