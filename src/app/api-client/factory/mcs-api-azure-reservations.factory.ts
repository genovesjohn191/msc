import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiAzureReservationsService } from '../interfaces/mcs-api-azure-reservations.interface';
import { McsApiAzureReservationsService } from '../services/mcs-api-azure-reservations.service';

export class McsApiAzureReservationsFactory extends McsApiEntityFactory<IMcsApiAzureReservationsService> {
  constructor() {
    super(McsApiAzureReservationsService);
  }
}
