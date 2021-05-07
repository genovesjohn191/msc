import { CommonDefinition, JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  TerraformDeploymentActivityType,
  TerraformDeploymentActivityTypeSerialization
} from '../enumerations/terraform-deployment-activity-type.enum';
import { TerraformDeploymentStatus, TerraformDeploymentStatusSerialization, terraformDeploymentStatusText } from '../enumerations/terraform-deployment-status.enum';
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

  @JsonProperty({
    serializer: TerraformDeploymentStatusSerialization,
    deserializer: TerraformDeploymentStatusSerialization
  })
  public status: TerraformDeploymentStatus = undefined;

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

  public get statusIconKey(): string {
    switch (this.status) {
      case TerraformDeploymentStatus.Unknown:   // Red
      case TerraformDeploymentStatus.Failed:
        return CommonDefinition.ASSETS_SVG_STATE_STOPPED;

      case TerraformDeploymentStatus.Succeeded: // Green
        return CommonDefinition.ASSETS_SVG_STATE_RUNNING;

      case TerraformDeploymentStatus.InProgress: // Amber
        return CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS;

      case TerraformDeploymentStatus.New: // Grey
      case TerraformDeploymentStatus.WaitingConfirmation:
        return CommonDefinition.ASSETS_SVG_STATE_SUSPENDED;
    }
  }

  public get statusLabel(): string {
    return (this.isProcessing) ?
      this.processingText :
      terraformDeploymentStatusText[this.status];
  }
}
