import { EventBusState } from '@peerlancers/ngx-event-bus';
import { McsStorageBackUpAggregationTarget } from '@app/models';

export class DataChangeAggregationTargetsEvent extends EventBusState<McsStorageBackUpAggregationTarget[]> {
  constructor() {
    super('DataChangeAggregationTargetsEvent');
  }
}
