import { EventBusState } from '@app/event-bus';
import { McsRouteInfo } from '@app/models';

export class RouteChangeEvent extends EventBusState<McsRouteInfo> {
  constructor() {
    super('RouteChange');
  }
}
