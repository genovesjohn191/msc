import { Injectable } from '@angular/core';
import { McsServerOperatingSystem } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { McsServersOsDataContext } from '../data-context/mcs-servers-os-data.context';

@Injectable()
export class McsServersOsRepository extends McsRepositoryBase<McsServerOperatingSystem> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsServersOsDataContext(
      _apiClientFactory.getService(new McsApiServersFactory())
    ));
  }
}
