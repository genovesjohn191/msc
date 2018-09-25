import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsProduct
} from '@app/models';
import { ProductsApiService } from '../api-services/products-api.service';

@Injectable()
export class ProductsRepository extends McsRepositoryBase<McsProduct> {

  constructor(private _productsApiService: ProductsApiService) {
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
  ): Observable<McsApiSuccessResponse<McsProduct[]>> {
    return this._productsApiService.getProducts({
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsProduct>> {
    return this._productsApiService.getProduct(recordId);
  }
}
