import { Injectable } from '@angular/core';
import { McsCompany } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { McsCompaniesDataContext } from '../data-context/mcs-companies-data.context';
import { CompaniesApiService } from '../api-services/companies-api.service';

@Injectable()
export class McsCompaniesRepository extends McsRepositoryBase<McsCompany> {

  constructor(_companiesApiService: CompaniesApiService) {
    super(new McsCompaniesDataContext(_companiesApiService));
  }
}
