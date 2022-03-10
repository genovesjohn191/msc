import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  azureManagementServiceTypeText,
  AzureManagementServiceType,
  AzureManagementServiceTypeSerialization
} from '../enumerations/azure-management-service-type.enum';

export class McsAzureManagementService extends McsEntityBase {

  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public mcaContact: string = undefined;

  @JsonProperty()
  public isEssentials: boolean = undefined;

  @JsonProperty()
  public azureActiveDirectoryDomainName: string = undefined;

  @JsonProperty()
  public linkedSubscription: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  /**
   * Returns the Azure Management Service type
   */
  public get AzureManagementServiceType(): string {
    return this.isEssentials ? azureManagementServiceTypeText[AzureManagementServiceType.Essentials] :
      azureManagementServiceTypeText[AzureManagementServiceType.Managed];
  }
}
