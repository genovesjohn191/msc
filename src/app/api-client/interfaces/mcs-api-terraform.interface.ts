import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsAzureDeploymentsQueryParams,
  McsJob,
  McsQueryParam,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity,
  McsTerraformDeploymentCreate,
  McsTerraformDeploymentCreateActivity,
  McsTerraformDeploymentUpdate,
  McsTerraformModule,
  McsTerraformTag,
  McsTerraformTagQueryParams
} from '@app/models';

export interface IMcsApiTerraformService {

  /**
   * Get Terraform deployments (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getDeployments(query?: McsAzureDeploymentsQueryParams): Observable<McsApiSuccessResponse<McsTerraformDeployment[]>>;

  /**
   * Get Terraform deployment by ID (MCS API Response)
   * @param id Terraform Deployment identification
   */
  getDeployment(id: any): Observable<McsApiSuccessResponse<McsTerraformDeployment>>;

  /**
   * Get Terraform deployment activities by deployment ID (MCS API Response)
   * @param id Terraform Deployment identification
   */
  getDeploymentActivities(id: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsTerraformDeploymentActivity[]>>;

  /**
   * Get Terraform deployment activity by activity ID (MCS API Response)
   * @param id Terraform Deployment activity identification
   */
   getDeploymentActivity(id: any): Observable<McsApiSuccessResponse<McsTerraformDeploymentActivity>>;

  /**
   * This will create the new deployment
   * @param deploymentData Deployment data to be created
   */
  createDeployment(deploymentData: McsTerraformDeploymentCreate): Observable<McsApiSuccessResponse<McsTerraformDeployment>>;

  /**
   * This will update an existing deployment
   * @param id Terraform Deployment identification
   * @param deploymentData Deployment data to be created
   */
  updateDeployment(id: any, deploymentData: McsTerraformDeploymentUpdate): Observable<McsApiSuccessResponse<McsTerraformDeployment>>;

  /**
   * Delete Terraform deployment by ID (MCS API Response)
   * @param id Terraform Deployment identification
   */
  deleteDeployment(id: any): Observable<McsApiSuccessResponse<boolean>>;

  /**
   * Get Terraform modules (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getModules(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformModule[]>>;

   /**
    * Get Terraform module by ID (MCS API Response)
    * @param id Terraform module identification
    */
  getModule(id: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformModule>>;

   /**
    * Get Terraform tags (MCS API Response)
    * @param query Query predicate that serves as the parameter of the endpoint
    */
  getTags(query?: McsTerraformTagQueryParams, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformTag[]>>;

  /**
   * Get Terraform tag by ID (MCS API Response)
   * @param id Terraform tag identification
   */
  getTag(id: any, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsTerraformTag>>;

  /**
   * This will create the a deployment activity for the target azure deployment
   * @param id Id of the deployment to run the plan against
   * @param request Request payload for the activity
   */
  createDeploymentActivity(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will create the a plan for the target azure deployment
   * @param id Id of the deployment to run the plan against
   * @param request Request payload for the action
   */
  createPlan(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will apply the variable changes on the target azure deployment
   * @param id Id of the deployment to run apply against
   * @param request Request payload for the action
   */
  applyDeployment(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will destroy recent applied deployment changes
   * @param id Id of the deployment to destroy
   * @param request Request payload for the action
   */
  destroyDeployment(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsApiSuccessResponse<McsJob>>;
}
