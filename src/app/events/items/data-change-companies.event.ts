import { EventBusState } from '@app/event-bus';
import { McsCompany } from '@app/models';

export class DataChangeCompaniesEvent extends EventBusState<McsCompany[]> {
  constructor() {
    super('DataChangeCompaniesEvent');
  }
}
