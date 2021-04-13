import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsTerraformDeployment,
  McsTerraformModule,
  McsTerraformTag,
} from '@app/models';

export interface IMcsApiTerraformService {

  /**
   * Get Terraform deployments (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getDeployments(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTerraformDeployment[]>>;

  /**
   * Get Terraform deployment by ID (MCS API Response)
   * @param id Terraform Deployment identification
   */
  getDeployment(id: any): Observable<McsApiSuccessResponse<McsTerraformDeployment>>;

  /**
   * Get Terraform modules (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getModules(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTerraformModule[]>>;

   /**
    * Get Terraform module by ID (MCS API Response)
    * @param id Terraform module identification
    */
  getModule(id: any): Observable<McsApiSuccessResponse<McsTerraformModule>>;

   /**
    * Get Terraform tags (MCS API Response)
    * @param query Query predicate that serves as the parameter of the endpoint
    */
  getTags(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTerraformTag[]>>;

  /**
   * Get Terraform tag by ID (MCS API Response)
   * @param id Terraform tag identification
   */
  getTag(id: any): Observable<McsApiSuccessResponse<McsTerraformTag>>;
}
