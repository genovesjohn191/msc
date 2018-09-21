import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsProduct
} from '@app/models';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsRepository extends McsRepositoryBase<McsProduct> {

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
  ): Observable<McsApiSuccessResponse<McsProduct[]>> {
    return this._productsService.getProducts({
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
    return this._productsService.getProduct(recordId);
  }
}
