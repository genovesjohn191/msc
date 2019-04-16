import { Injectable } from '@angular/core';
import { McsPortal } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiToolsFactory
} from '@app/api-client';
import { McsToolsDataContext } from '../data-context/mcs-tools-data.context';

@Injectable()
export class McsToolsRepository extends McsRepositoryBase<McsPortal> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsToolsDataContext(
      _apiClientFactory.getService(new McsApiToolsFactory())
    ));
  }
}
