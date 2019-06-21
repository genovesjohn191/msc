import { Injectable } from '@angular/core';
import { McsResource } from '@app/models';
import {
  McsApiResourcesFactory,
  McsApiClientFactory
} from '@app/api-client';
import { McsResourcesDataContext } from '../data-context/mcs-resources-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsResourcesRepository extends McsRepositoryBase<McsResource> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsResourcesDataContext(
      _apiClientFactory.getService(new McsApiResourcesFactory())
    ));
  }
}
