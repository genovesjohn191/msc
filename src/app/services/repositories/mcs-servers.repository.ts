import { Injectable } from '@angular/core';
import { McsServer } from '@app/models';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { McsServersDataContext } from '../data-context/mcs-servers-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsServersRepository extends McsRepositoryBase<McsServer> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsServersDataContext(
      _apiClientFactory.getService(new McsApiServersFactory())
    ));
  }
}
