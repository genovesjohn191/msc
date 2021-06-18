import { EventBusState } from '@app/event-bus';
import { McsAzureReservation } from '@app/models';

export class DataChangeAzureReservationsEvent extends EventBusState<McsAzureReservation[]> {
  constructor() {
    super('DataChangeAzureReservationsEvent');
  }
}