import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import {
  TerraformDeploymentActivityType,
  TerraformDeploymentActivityTypeSerialization
} from '../enumerations/terraform-deployment-activity-type.enum';

export interface McsTerraformDeploymentCreateActivityRefObj {
  terraformDeploymentId: string;
  terraformActivityRefId: string;
  type: TerraformDeploymentActivityType;
}

export class McsTerraformDeploymentCreateActivity extends McsApiJobRequestBase<McsTerraformDeploymentCreateActivityRefObj> {
  @JsonProperty()
  public confirm: boolean = undefined;

  @JsonProperty({
    serializer: TerraformDeploymentActivityTypeSerialization,
    deserializer: TerraformDeploymentActivityTypeSerialization
  })
  public type: TerraformDeploymentActivityType = undefined;
}
