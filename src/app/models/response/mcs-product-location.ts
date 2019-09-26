import { JsonProperty } from '@peerlancers/json-serialization';
import { isNullOrEmpty } from '@app/utilities';
import { McsProductFacilityManager } from './mcs-product-facility-manager';
import {
  ProductLocationStatus,
  ProductLocationStatusSerialization
} from '../enumerations/product-location-status.enum';

export class McsProductLocation {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public street: string = undefined;

  @JsonProperty()
  public city: string = undefined;

  @JsonProperty()
  public postCode: string = undefined;

  @JsonProperty()
  public country: string = undefined;

  @JsonProperty({
    serializer: ProductLocationStatusSerialization,
    deserializer: ProductLocationStatusSerialization
  })
  public status: ProductLocationStatus = undefined;

  @JsonProperty({ target: McsProductFacilityManager })
  public facilityManager: McsProductFacilityManager = undefined;

  @JsonProperty()
  public securityPhone: string = undefined;

  @JsonProperty()
  public hmcPhone: string = undefined;

  /**
   * Returns the complete address of the location
   */
  public get fullAddress(): string {
    let addressList = [`${this.street} ${this.city}`, this.country, this.postCode];
    addressList = addressList.filter((address) => !isNullOrEmpty(address));
    return addressList.join(', ');
  }
}
