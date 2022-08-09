import { EventBusState } from '@app/event-bus';
import { McsNotice } from '@app/models';

export class NoticeReceiveEvent extends EventBusState<McsNotice> {
  constructor() {
    super('NoticeReceiveEvent');
  }
}
