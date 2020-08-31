import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsColocationRack,
  McsColocationAntenna,
  McsColocationCustomDevice,
  McsColocationRoom,
  McsColocationStandardSqm
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiColocationsService } from '../interfaces/mcs-api-colocations.interface';

@Injectable()
export class McsApiColocationsService implements IMcsApiColocationsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  /**
   * Get Colocation Racks
   */
  getColocationRacks(): Observable<McsApiSuccessResponse<McsColocationRack[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/colocation/racks';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsColocationRack[]>(McsColocationRack, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Colocation Antennas
   */
  getColocationAntennas(): Observable<McsApiSuccessResponse<McsColocationAntenna[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/colocation/antennas';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsColocationAntenna[]>(McsColocationAntenna, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Colocation Custom Devices
   */
  getColocationCustomDevices(): Observable<McsApiSuccessResponse<McsColocationCustomDevice[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/colocation/custom-devices';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsColocationCustomDevice[]>(McsColocationCustomDevice, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Colocation Rooms
   */
  getColocationRooms(): Observable<McsApiSuccessResponse<McsColocationRoom[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/colocation/rooms';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsColocationRoom[]>(McsColocationRoom, response);
          return apiResponse;
        })
      );
  }

  /**
   * Get Colocation Standard Square Metres
   */
  getColocationStandardSqms(): Observable<McsApiSuccessResponse<McsColocationStandardSqm[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/colocation/standard-square-metres';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsColocationStandardSqm[]>(McsColocationStandardSqm, response);
          return apiResponse;
        })
      );
  }
}
