import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTenant extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

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
  public active: boolean = undefined;

  @JsonProperty()
  public tenantId: string = undefined;

  @JsonProperty()
  public commerceId: string = undefined;

  @JsonProperty()
  public relationshipToPartner: string = undefined;

  @JsonProperty()
  public primaryDomain: string = undefined;

  @JsonProperty()
  public initialDomain: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public allowDelegatedAccess: boolean = undefined;

  @JsonProperty()
  public attentionNeeded: boolean = undefined;

  @JsonProperty()
  public country: string = undefined;

  @JsonProperty()
  public region: string = undefined;

  @JsonProperty()
  public city: string = undefined;

  @JsonProperty()
  public state: string = undefined;

  @JsonProperty()
  public addressLine1: string = undefined;

  @JsonProperty()
  public addressLine2: string = undefined;

  @JsonProperty()
  public postalCode: number = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public azurePlanId: string = undefined;
}
