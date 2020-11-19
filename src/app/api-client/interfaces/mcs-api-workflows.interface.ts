import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsJob,
  McsWorkflowCreate
} from '@app/models';

export interface IMcsApiWorkflowsService {
  /**
   * This will provision workflows
   * @param workflows Workflows to be provisioned
   */
  provisionWorkflow(workflows: McsWorkflowCreate[]): Observable<McsApiSuccessResponse<McsJob[]>>;
}
