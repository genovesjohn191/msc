import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsAzureReservation,
  McsReservationProductType,
  McsReservationProductTypeQueryParams
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiAzureReservationsService } from '../interfaces/mcs-api-azure-reservations.interface';

@Injectable()
export class McsApiAzureReservationsService implements IMcsApiAzureReservationsService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureReservations(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsAzureReservation[]>> {
     // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/reservations`;
    requestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureReservation[]>(
            McsAzureReservation, response
        );
      })
    );
  }

  public getAzureReservationById(id: string): Observable<McsApiSuccessResponse<McsAzureReservation>> {
    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/reservations/${id}`;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsAzureReservation>(
            McsAzureReservation, response
          );
      })
    );
  }

  public getAzureReservationProductTypes(query?: McsReservationProductTypeQueryParams):
    Observable<McsApiSuccessResponse<McsReservationProductType[]>> {

    // Set default values if null
    let searchParams = new Map<string, any>();
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }
    searchParams.set('page', query.pageIndex);
    searchParams.set('per_page', query.pageSize);
    searchParams.set('search_keyword', query.keyword);
    searchParams.set('sku_id', query.skuId);
    searchParams.set('product_id', query.productId);

    let requestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    requestParameter.endPoint = `/public-cloud/reservations/products/types`;
    requestParameter.searchParameters = searchParams;

    return this._mcsApiHttpService.get(requestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsReservationProductType[]>(
            McsReservationProductType, response
        );
      })
    );
  }
}
