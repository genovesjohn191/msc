import { JsonProperty } from '@app/utilities';
import { CrispObjectStatus, crispObjectStatusText } from '../enumerations/crisp-object-status.enum';
import { ProductType } from '../enumerations/product-type.enum';

export class McsObjectCrispElementServiceAttribute {
  @JsonProperty()
  public code: string = undefined;

  @JsonProperty()
  public value: string | string[] = undefined;

  @JsonProperty()
  public displayValue: string = undefined;
}

export class McsObjectCrispElementService {
  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public productType: ProductType = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}

export class McsObjectCrispElement extends McsObjectCrispElementService {
  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public orderId: string = undefined;

  @JsonProperty()
  public assignedTo: string = undefined;

  @JsonProperty()
  public hostingEngineer: string = undefined;

  @JsonProperty()
  public status: CrispObjectStatus = undefined;

  @JsonProperty()
  public createdOn: string = undefined;

  @JsonProperty({ target: McsObjectCrispElementServiceAttribute })
  public serviceAttributes: McsObjectCrispElementServiceAttribute[] = undefined;

  @JsonProperty({ target: McsObjectCrispElementService })
  public associatedServices: McsObjectCrispElementService[] = undefined;

  /**
   * Returns the status label
   */
  public get crispStatusLabel(): string {
    return crispObjectStatusText[this.status] || null;
  }
}
