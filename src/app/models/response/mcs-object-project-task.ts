import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsObjectProjectTasks extends McsEntityBase {
  @JsonProperty()
  public orderId: number = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public crispProductType: string = undefined;

  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public assignedTo: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public productId: number = undefined;

  @JsonProperty()
  public productType: string = undefined;

  @JsonProperty()
  public companyId: number = undefined;
}
