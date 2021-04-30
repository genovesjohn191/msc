import {
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  TerraformDeploymentStatus,
  TerraformDeploymentStatusSerialization
} from '../enumerations/terraform-deployment-status.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTerraformDeployment extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public subscriptionName: string = undefined;

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
  public updatedBy: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public company: string = undefined;

  @JsonProperty()
  public slugId: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public tag: string = undefined;

  @JsonProperty()
  public tagName: string = undefined;

  @JsonProperty()
  public subscriptionServiceId: string = undefined;

  @JsonProperty()
  public tenantName: string = undefined;

  @JsonProperty()
  public tenantId: string = undefined;

  @JsonProperty()
  public moduleName: string = undefined;

  @JsonProperty()
  public busy: boolean = undefined;

  @JsonProperty({
    serializer: TerraformDeploymentStatusSerialization,
    deserializer: TerraformDeploymentStatusSerialization
  })
  public status: TerraformDeploymentStatus = undefined;

  public get statusIconKey(): string {
    // TODO(apascual): Check the status of deployment
    // ASSETS_SVG_STATE_RUNNING , ASSETS_SVG_STATE_RESTARTING, ASSETS_SVG_STATE_STOPPED
    return CommonDefinition.ASSETS_SVG_STATE_RUNNING;
  }
}
