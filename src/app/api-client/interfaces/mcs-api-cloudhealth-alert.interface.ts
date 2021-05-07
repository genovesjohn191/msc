import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsCloudHealthAlert
} from '@app/models';

export interface IMcsApiCloudHealthAlertService {
  getCloudHealthAlerts(
    periodStart?: string,
    periodEnd?: string
  ): Observable<McsApiSuccessResponse<McsCloudHealthAlert[]>>;

  getCloudHealthAlertById(id?: string): Observable<McsApiSuccessResponse<McsCloudHealthAlert>>;
}
