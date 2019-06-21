import { Injectable } from '@angular/core';
import {
  McsTicket
} from '@app/models';
import {
  McsApiClientFactory,
  McsApiTicketsFactory
} from '@app/api-client';
import { McsTicketsDataContext } from '../data-context/mcs-tickets-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsTicketsRepository extends McsRepositoryBase<McsTicket> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsTicketsDataContext(
      _apiClientFactory.getService(new McsApiTicketsFactory())
    ));
  }
}
