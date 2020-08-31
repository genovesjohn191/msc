import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsColocationRack,
  McsColocationAntenna,
  McsColocationCustomDevice,
  McsColocationRoom,
  McsColocationStandardSqm
} from '@app/models';

export interface IMcsApiColocationsService {

  /**
   * Get Colocation Racks
   */
  getColocationRacks(): Observable<McsApiSuccessResponse<McsColocationRack[]>>;

  /**
   * Get Colocation Antennas
   */
  getColocationAntennas(): Observable<McsApiSuccessResponse<McsColocationAntenna[]>>;

  /**
   * Get Colocation Custom Devices
   */
  getColocationCustomDevices(): Observable<McsApiSuccessResponse<McsColocationCustomDevice[]>>;

  /**
   * Get Colocation Rooms
   */
  getColocationRooms(): Observable<McsApiSuccessResponse<McsColocationRoom[]>>;

  /**
   * Get Colocation Standard Square Meters
   */
  getColocationStandardSqms(): Observable<McsApiSuccessResponse<McsColocationStandardSqm[]>>;

}
