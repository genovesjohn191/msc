import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  TerraformDeploymentActivityType,
  TerraformDeploymentActivityTypeSerialization
} from '../enumerations/terraform-deployment-activity-type.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import { McsJob } from './mcs-job';

export class McsTerraformDeploymentActivity extends McsEntityBase {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public tagName: string = undefined;

  @JsonProperty({
    serializer: TerraformDeploymentActivityTypeSerialization,
    deserializer: TerraformDeploymentActivityTypeSerialization
  })
  public type: TerraformDeploymentActivityType = undefined;

  @JsonProperty()
  public job: McsJob = undefined;

  @JsonProperty()
  public result: string = undefined;
}
