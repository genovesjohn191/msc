import {
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTerraformDeployment extends McsEntityBase {
  @JsonProperty()
  public subscriptionServiceId: string = undefined;

  @JsonProperty()
  public tenantName: string = undefined;

  @JsonProperty()
  public tenantId: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public slugId: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public tag: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;

  @JsonProperty()
  public updatedBy: string = undefined;

  public get statusIconKey(): string {
    // TODO(apascual): Check the status of deployment
    // ASSETS_SVG_STATE_RUNNING , ASSETS_SVG_STATE_RESTARTING, ASSETS_SVG_STATE_STOPPED
    return CommonDefinition.ASSETS_SVG_STATE_RUNNING;
  }
}
