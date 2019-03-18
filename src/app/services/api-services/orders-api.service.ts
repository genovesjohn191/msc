import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  finalize
} from 'rxjs/operators';
/** Services and Models */
import {
  McsApiService,
  McsLoggerService
} from '@app/core';
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
  McsQueryParam,
  McsBilling
} from '@app/models';

@Injectable()
export class OrdersApiService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService
  ) { }

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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder[]>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType[]>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItemType>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsBilling[]>(McsBilling, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrderItem>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
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
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsOrder>(McsOrder, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }
}
