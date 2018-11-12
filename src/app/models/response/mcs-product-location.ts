import { JsonProperty } from 'json-object-mapper';
import { McsProductFacilityManager } from './mcs-product-facility-manager';
import {
  ProductLocationStatus,
  ProductLocationStatusSerialization
} from '../enumerations/product-location-status.enum';

export class McsProductLocation {
  public name: string;
  public street: string;
  public city: string;
  public postCode: string;
  public country: string;

  @JsonProperty({
    type: McsProductFacilityManager,
    serializer: ProductLocationStatusSerialization,
    deserializer: ProductLocationStatusSerialization
  })
  public status: ProductLocationStatus;

  @JsonProperty({ type: McsProductFacilityManager })
  public facilityManager: McsProductFacilityManager;

  public securityPhone: string;
  public hmcPhone: string;

  constructor() {
    this.city = undefined;
    this.country = undefined;
    this.facilityManager = undefined;
    this.hmcPhone = undefined;
    this.name = undefined;
    this.postCode = undefined;
    this.securityPhone = undefined;
    this.status = undefined;
    this.street = undefined;
  }

  /**
   * Returns the complete address of the location
   */
  public get fullAddress(): string {
    return `${this.street} ${this.city}, ${this.country}, ${this.postCode}`;
  }
}
