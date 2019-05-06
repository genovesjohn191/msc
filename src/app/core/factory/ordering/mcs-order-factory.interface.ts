import { Observable } from 'rxjs';
import {
  McsOrder,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemType
} from '@app/models';

export interface IMcsOrderFactory {

  createOrder(orderDetails: McsOrderCreate): Observable<McsOrder>;

  updateOrder(orderId: string, orderDetails: McsOrderCreate): Observable<McsOrder>;

  createOrderWorkFlow(orderId: string, workflowDetails: McsOrderWorkflow): Observable<McsOrder>;

  getItemOrderType(typeId: string): Observable<McsOrderItemType>;
}
