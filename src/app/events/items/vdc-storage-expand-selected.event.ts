import { EventBusState } from '@app/event-bus';
import { McsExpandResourceStorage } from '@app/models';

export class VdcStorageExpandSelectedEvent extends EventBusState<McsExpandResourceStorage> {
  constructor() {
    super('VdcStorageExpandSelectedEvent');
  }
}
