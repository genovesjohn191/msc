import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import { TerraformDeploymentActivityType } from '../enumerations/terraform-deployment-activity-type.enum';

export interface McsTerraformDeploymentDeleteRefObj {
  terraformDeploymentId: string;
  terraformActivityRefId: string;
  type: TerraformDeploymentActivityType;
}

export class McsTerraformDeploymentDelete extends McsApiJobRequestBase<McsTerraformDeploymentDeleteRefObj> {
  @JsonProperty()
  public confirm: boolean = undefined;

  @JsonProperty()
  public destroy: boolean = undefined;
}
