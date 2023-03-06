import { EventBusState } from '@app/event-bus';
import { McsNonStandardBundle } from '@app/models';

export class DataChangeNonStandardBundlesEvent extends EventBusState<McsNonStandardBundle[]> {
  constructor() {
    super('DataChangeNonStandardBundlesEvent');
  }
}