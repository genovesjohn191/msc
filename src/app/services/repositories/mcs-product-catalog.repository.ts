import { Injectable } from '@angular/core';
import { McsProductCatalog } from '@app/models';
import {
  McsApiClientFactory,
  McsApiProductsFactory
} from '@app/api-client';
import { McsProductCatalogDataContext } from '../data-context/mcs-product-catalog-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsProductCatalogRepository extends McsRepositoryBase<McsProductCatalog> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsProductCatalogDataContext(
      _apiClientFactory.getService(new McsApiProductsFactory())
    ));
  }
}
