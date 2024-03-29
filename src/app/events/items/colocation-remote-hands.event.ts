import { EventBusState } from '@app/event-bus';
import { McsLicense } from '@app/models';

export class ColocationRemoteHands extends EventBusState<McsLicense> {
  constructor() {
    super('RemoteHandsChangeEvent');
  }
}
