import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiSuccessResponse,
  McsOrderItemType
} from '@app/models';
import { OrdersApiService } from '../api-services/orders-api.service';

@Injectable()
export class OrderItemTypesRepository extends McsRepositoryBase<McsOrderItemType> {

  constructor(private _ordersApiService: OrdersApiService) {
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
  ): Observable<McsApiSuccessResponse<McsOrderItemType[]>> {
    return this._ordersApiService.getOrderItemTypes();
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<McsOrderItemType>> {
    return this._ordersApiService.getOrderItemType(recordId);
  }
}
