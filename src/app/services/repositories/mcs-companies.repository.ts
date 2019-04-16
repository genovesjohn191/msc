import { Injectable } from '@angular/core';
import { McsCompany } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiCompaniesFactory
} from '@app/api-client';
import { McsCompaniesDataContext } from '../data-context/mcs-companies-data.context';

@Injectable()
export class McsCompaniesRepository extends McsRepositoryBase<McsCompany> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsCompaniesDataContext(
      _apiClientFactory.getService(new McsApiCompaniesFactory())
    ));
  }
}
