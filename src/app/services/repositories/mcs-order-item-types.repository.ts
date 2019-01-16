import { Injectable } from '@angular/core';
import { McsOrderItemType } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { OrdersApiService } from '../api-services/orders-api.service';
import { McsOrderItemTypesDataContext } from '../data-context/mcs-order-item-types-data.context';

@Injectable()
export class McsOrderItemTypesRepository extends McsRepositoryBase<McsOrderItemType> {

  constructor(_ordersApiService: OrdersApiService) {
    super(new McsOrderItemTypesDataContext(_ordersApiService));
  }
}
