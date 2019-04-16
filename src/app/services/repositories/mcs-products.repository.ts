import { Injectable } from '@angular/core';
import { McsProduct } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiProductsFactory
} from '@app/api-client';
import { McsProductsDataContext } from '../data-context/mcs-products-data.context';

@Injectable()
export class McsProductsRepository extends McsRepositoryBase<McsProduct> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsProductsDataContext(
      _apiClientFactory.getService(new McsApiProductsFactory())
    ));
  }
}
