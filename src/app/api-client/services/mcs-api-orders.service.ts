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
  McsQueryParam,
  McsOrderAvailable
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiOrdersService } from '../interfaces/mcs-api-orders.interface';

@Injectable()
export class McsApiOrdersService implements IMcsApiOrdersService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

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

  public getOrderItemTypes(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsOrderItemType[]>> {
    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders/items/types';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType[]>(McsOrderItemType, response);
          return apiResponse;
        })
      );
  }

  public getOrderItemType(id: any): Observable<McsApiSuccessResponse<McsOrderItemType>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/orders/items/types/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType>(McsOrderItemType, response);
          return apiResponse;
        })
      );
  }

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

  public getOrderAvailableItemTypes(): Observable<McsApiSuccessResponse<McsOrderAvailable[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/orders/available-item-types';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderAvailable[]>(McsOrderAvailable, response);
          return apiResponse;
        })
      );
  }

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

  public createOrderWorkflow(id: any, workflowDetails: McsOrderWorkflow): Observable<McsApiSuccessResponse<McsOrder>> {
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
