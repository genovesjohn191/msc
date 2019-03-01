import { Observable } from 'rxjs';
import {
  McsOrder,
  McsOrderCreate,
  McsOrderWorkflow
} from '@app/models';

export interface IMcsOrderFactory {

  createOrder(orderDetails: McsOrderCreate): Observable<McsOrder>;

  updateOrder(orderId: string, orderDetails: McsOrderCreate): Observable<McsOrder>;

  createOrderWorkFlow(orderId: string, workflowDetails: McsOrderWorkflow): Observable<McsOrder>;
}
