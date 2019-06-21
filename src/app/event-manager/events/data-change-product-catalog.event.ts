import { EventBusState } from '@app/event-bus';
import { McsProductCatalog } from '@app/models';

export class DataChangeProductCatalogEvent extends EventBusState<McsProductCatalog[]> {
  constructor() {
    super('DataChangeProductCatalogEvent');
  }
}
