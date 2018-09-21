import { Injectable } from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsRepositoryBase,
  McsAccessControlService,
  CoreDefinition
} from '@app/core';
import {
  McsApiSuccessResponse,
  McsProductCatalog
} from '@app/models';
import { ProductsService } from './products.service';

@Injectable()
export class ProductCatalogRepository extends McsRepositoryBase<McsProductCatalog> {

  constructor(
    private _productsService: ProductsService,
    private _accessControlService: McsAccessControlService
  ) {
    super();
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._accessControlService.hasAccessToFeature
      (CoreDefinition.FEATURE_FLAG_ENABLE_PRODUCT_CATALOG);
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data inbound
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<McsProductCatalog[]>> {
    if (!this.productCatalogFeatureIsOn) { return of(undefined); }
    return this._productsService.getCatalogs({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsProductCatalog>> {
    if (!this.productCatalogFeatureIsOn) { return of(undefined); }
    return this._productsService.getCatalog(recordId);
  }
}
