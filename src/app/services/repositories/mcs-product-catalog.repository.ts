import { Injectable } from '@angular/core';
import {
  McsRepositoryBase,
  McsAccessControlService,
  CoreDefinition
} from '@app/core';
import { McsProductCatalog } from '@app/models';
import {
  McsApiClientFactory,
  McsApiProductsFactory
} from '@app/api-client';
import { McsProductCatalogDataContext } from '../data-context/mcs-product-catalog-data.context';

@Injectable()
export class McsProductCatalogRepository extends McsRepositoryBase<McsProductCatalog> {

  constructor(
    _apiClientFactory: McsApiClientFactory,
    private _accessControlService: McsAccessControlService
  ) {
    super(new McsProductCatalogDataContext(
      _apiClientFactory.getService(new McsApiProductsFactory())
    ));
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._accessControlService.hasAccessToFeature
      (CoreDefinition.FEATURE_FLAG_ENABLE_PRODUCT_CATALOG);
  }
}
