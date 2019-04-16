import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { McsApiTicketsService } from '../services/mcs-api-tickets.service';
import { IMcsApiTicketsService } from '../interfaces/mcs-api-tickets.interface';

export class McsApiTicketsFactory extends McsApiEntityFactory<IMcsApiTicketsService> {
  constructor() {
    super(McsApiTicketsService);
  }
}
