import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsRepositoryBase,
  McsApiSuccessResponse
} from '../../../core';
import { OrdersService } from '../orders.service';
import { Order } from '../models';

@Injectable()
export class OrdersRepository extends McsRepositoryBase<Order> {

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
  ): Observable<McsApiSuccessResponse<Order[]>> {
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
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Order>> {
    return this._ordersApiService.getOrder(recordId);
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   */
  protected afterDataObtained(): void {
    // Implement initialization of events here
  }
}
