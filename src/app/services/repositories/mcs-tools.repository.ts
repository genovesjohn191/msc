import { Injectable } from '@angular/core';
import { McsPortal } from '@app/models';
import {
  McsApiClientFactory,
  McsApiToolsFactory
} from '@app/api-client';
import { McsToolsDataContext } from '../data-context/mcs-tools-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsToolsRepository extends McsRepositoryBase<McsPortal> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsToolsDataContext(
      _apiClientFactory.getService(new McsApiToolsFactory())
    ));
  }
}
