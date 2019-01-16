import { Injectable } from '@angular/core';
import { McsProduct } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { ProductsApiService } from '../api-services/products-api.service';
import { McsProductsDataContext } from '../data-context/mcs-products-data.context';

@Injectable()
export class McsProductsRepository extends McsRepositoryBase<McsProduct> {

  constructor(_productsApiService: ProductsApiService) {
    super(new McsProductsDataContext(_productsApiService));
  }
}
