import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsOrder
} from '@app/models';
import { OrdersService } from '../orders.service';

@Injectable()
export class OrdersRepository extends McsRepositoryBase<McsOrder> {

  constructor(private _ordersApiService: OrdersService) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    _pageIndex: number,
    _pageSize: number,
    _keyword: string
  ): Observable<McsApiSuccessResponse<McsOrder[]>> {
    return this._ordersApiService.getOrders({
      page: _pageIndex,
      perPage: _pageSize,
      searchKeyword: _keyword
    });
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsOrder>> {
    return this._ordersApiService.getOrder(recordId);
  }
}
