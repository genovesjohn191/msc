import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsAzureReservation,
  McsQueryParam
} from '@app/models';

export interface IMcsApiAzureReservationsService {

  /**
   * Gets all azure reservations
   */
  getAzureReservations(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAzureReservation[]>>;

  /**
   * Gets azure reservation by id
   */
  getAzureReservationById(id: string): Observable<McsApiSuccessResponse<McsAzureReservation>>;
}
