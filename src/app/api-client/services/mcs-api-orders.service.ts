import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  serializeObjectToJson,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsOrder,
  McsOrderItemType,
  McsOrderCreate,
  McsOrderUpdate,
  McsOrderMerge,
  McsOrderItem,
  McsOrderWorkflow,
  McsBilling,
  McsOrderApprover,
  McsQueryParam
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiOrdersService } from '../interfaces/mcs-api-orders.interface';

@Injectable()
export class McsApiOrdersService implements IMcsApiOrdersService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Orders (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getOrders(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsOrder[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder[]>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Order by ID (MCS API Response)
   * @param id Order identification
   */
  public getOrder(id: any): Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get the order items types (MCS API Response)
   */
  public getOrderItemTypes(): Observable<McsApiSuccessResponse<McsOrderItemType[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders/items/types';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType[]>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get order item type by ID (MCS API Response)
   * @param id Order identification
   */
  public getOrderItemType(id: any): Observable<McsApiSuccessResponse<McsOrderItemType>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/items/types/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Order Billing (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  public getBilling(): Observable<McsApiSuccessResponse<McsBilling[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders/billing';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsBilling[]>(McsBilling, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Order Approvers (MCS API Response)
   */
  public getOrderApprovers(): Observable<McsApiSuccessResponse<McsOrderApprover[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders/approvers';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderApprover[]>(McsOrderApprover, response);
          return apiResponse;
        })
      );
  }

  /**
   * This will create the new order based on the inputted information
   * @param orderData Order data to be created
   */
  public createOrder(orderData: McsOrderCreate): Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders';
    mcsApiRequestParameter.recordData = serializeObjectToJson(orderData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Updates the existing order details based on its identification
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  public updateOrder(
    id: any,
    orderUpdate: McsOrderUpdate
  ): Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(orderUpdate);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Deletes any existing order based on its inputted id
   * @param id Id of the order to be deleted
   */
  public deleteOrder(id: string): Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}`;

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Gets the workflow details of the existing order
   * @param id Id of the order to be obtained
   */
  public getOrderWorkflow(id: any): Observable<McsApiSuccessResponse<McsOrderItem>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}/workflow`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItem>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Creates the order workflow
   * @param orderData Order data to be created
   */
  public createOrderWorkflow(id: any, workflowDetails: McsOrderWorkflow):
    Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}/workflow`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(workflowDetails);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }

  /**
   * Submits the order to orchestration
   * @param orderData Order data to be created
   */
  public mergeOrder(id: any, mergeOrder: McsOrderMerge):
    Observable<McsApiSuccessResponse<McsOrder>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/${id}/merge`;
    mcsApiRequestParameter.recordData = serializeObjectToJson(mergeOrder);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);
          return apiResponse;
        })
      );
  }
}
