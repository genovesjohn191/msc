import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  McsAccessControlService,
  CoreDefinition
} from '@app/core';
import { McsProductCatalog } from '@app/models';
import { ProductsApiService } from '../api-services/products-api.service';
import { McsProductCatalogDataContext } from '../data-context/mcs-product-catalog-data.context';

@Injectable()
export class McsProductCatalogRepository extends McsRepositoryBase<McsProductCatalog> {

  constructor(
    _productsApiService: ProductsApiService,
    private _accessControlService: McsAccessControlService
  ) {
    super(new McsProductCatalogDataContext(_productsApiService));
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._accessControlService.hasAccessToFeature
      (CoreDefinition.FEATURE_FLAG_ENABLE_PRODUCT_CATALOG);
  }
}
