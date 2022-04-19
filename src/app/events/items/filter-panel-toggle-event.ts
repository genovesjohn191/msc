import { EventBusState } from '@app/event-bus';
import { McsFilterPanel } from '@app/models';

export class FilterPanelToggleEvent extends EventBusState<McsFilterPanel> {
  constructor() {
    super('FilterPanelToggleEvent');
  }
}
