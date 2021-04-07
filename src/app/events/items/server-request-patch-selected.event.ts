import { EventBusState } from '@app/event-bus';
import { McsLicense } from '@app/models';

export class ServerRequestPatchSelectedEvent extends EventBusState<McsLicense> {
  constructor() {
    super('ServerRequestPatchSelectedEvent');
  }
}
