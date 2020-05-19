import { Injectable } from '@angular/core';
import { McsApiClientFactory } from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsApiLicensesFactory } from '@app/api-client/factory/mcs-api-licenses.factory';
import { McsLicense } from '@app/models';
import { McsLicensesDataContext } from '../data-context/mcs-licenses-data.context';

@Injectable()
export class MicsLicensesRepository extends McsRepositoryBase<McsLicense> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsLicensesDataContext(
      _apiClientFactory.getService(new McsApiLicensesFactory())
    ));
  }
}
