import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsOrder,
  McsOrderItemType,
  McsBilling,
  McsOrderApprover,
  McsOrderCreate,
  McsOrderUpdate,
  McsOrderItem,
  McsOrderMerge,
  McsOrderWorkflow
} from '@app/models';

export interface IMcsApiOrdersService {

  /**
   * Get Orders (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getOrders(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsOrder[]>>;

  /**
   * Get Order by ID (MCS API Response)
   * @param id Order identification
   */
  getOrder(id: any): Observable<McsApiSuccessResponse<McsOrder>>;

  /**
   * Get the order items types (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getOrderItemTypes(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsOrderItemType[]>>;

  /**
   * Get order item type by ID (MCS API Response)
   * @param id Order identification
   */
  getOrderItemType(id: any): Observable<McsApiSuccessResponse<McsOrderItemType>>;

  /**
   * Get Order Billing (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getBilling(): Observable<McsApiSuccessResponse<McsBilling[]>>;

  /**
   * Get Order Approvers (MCS API Response)
   */
  getOrderApprovers(): Observable<McsApiSuccessResponse<McsOrderApprover[]>>;

  /**
   * This will create the new order based on the inputted information
   * @param orderData Order data to be created
   */
  createOrder(orderData: McsOrderCreate): Observable<McsApiSuccessResponse<McsOrder>>;

  /**
   * Updates the existing order details based on its identification
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  updateOrder(id: any, orderUpdate: McsOrderUpdate): Observable<McsApiSuccessResponse<McsOrder>>;

  /**
   * Deletes any existing order based on its inputted id
   * @param id Id of the order to be deleted
   */
  deleteOrder(id: string): Observable<McsApiSuccessResponse<McsOrder>>;

  /**
   * Gets the workflow details of the existing order
   * @param id Id of the order to be obtained
   */
  getOrderWorkflow(id: any): Observable<McsApiSuccessResponse<McsOrderItem>>;

  /**
   * Creates the order workflow
   * @param orderData Order data to be created
   */
  createOrderWorkflow(id: any, workflowDetails: McsOrderWorkflow): Observable<McsApiSuccessResponse<McsOrder>>;

  /**
   * Submits the order to orchestration
   * @param orderData Order data to be created
   */
  mergeOrder(id: any, mergeOrder: McsOrderMerge): Observable<McsApiSuccessResponse<McsOrder>>;
}
