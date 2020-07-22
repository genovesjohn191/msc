import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsReportGenericItem
} from '@app/models';

export interface IMcsApiReportsService {
  getServicesCostOverviewReport(periodStart?: string, periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getVirtualMachineBreakdownReport(periodStart?: string, periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;

  getPerformanceReport(periodStart?: string, periodEnd?: string): Observable<McsApiSuccessResponse<McsReportGenericItem[]>>;
}
