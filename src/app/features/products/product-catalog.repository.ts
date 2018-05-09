import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../core';
import { ProductCatalog } from './models';
import { ProductsService } from './products.service';

@Injectable()
export class ProductCatalogRepository extends McsRepositoryBase<ProductCatalog> {

  constructor(private _productsService: ProductsService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data inbound
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<ProductCatalog[]>> {
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<ProductCatalog>> {
    return this._productsService.getCatalog(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
