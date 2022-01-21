import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  AzureManagementServiceChildType,
  AzureManagementServiceChildTypeSerialization,
  azureManagementServiceChildTypeText
} from '../enumerations/azure-management-service-child-type.enum';

export class McsAzureManagementServiceChild extends McsEntityBase {

  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: AzureManagementServiceChildTypeSerialization,
    deserializer: AzureManagementServiceChildTypeSerialization
  })
  private productType: AzureManagementServiceChildType = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  /**
   * Returns the service type label
   */
  public get AzureManagementServiceChildTypeLabel(): string {
    return azureManagementServiceChildTypeText[this.productType] || null;
  }

}
