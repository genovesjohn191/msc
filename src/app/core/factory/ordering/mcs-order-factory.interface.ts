import { Observable } from 'rxjs';
import {
  McsOrder,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemType,
  McsQueryParam
} from '@app/models';

export interface IMcsOrderFactory {

  createOrder(orderDetails: McsOrderCreate): Observable<McsOrder>;

  updateOrder(orderId: string, orderDetails: McsOrderCreate): Observable<McsOrder>;

  createOrderWorkFlow(orderId: string, workflowDetails: McsOrderWorkflow): Observable<McsOrder>;

  getOrderItemTypes(query?: McsQueryParam): Observable<McsOrderItemType[]>;

  getItemOrderType(typeId: string): Observable<McsOrderItemType>;
}
