import { Injectable } from '@angular/core';
import {
McsApiClientFactory,
McsApiAzureResourceFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAzureResource } from '@app/models';
import { McsAzureResourceDataContext } from '../data-context/mcs-azure-resource-data.context';

@Injectable()
export class McsAzureResourceRepository extends McsRepositoryBase<McsAzureResource> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsAzureResourceDataContext(
      _apiClientFactory.getService(new McsApiAzureResourceFactory())
    ));
  }
}
