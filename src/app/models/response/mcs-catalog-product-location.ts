import { JsonProperty } from '@app/utilities';
import { isNullOrEmpty } from '@app/utilities';
import { McsCatalogProductFacilityManager } from './mcs-catalog-product-facility-manager';
import {
  ProductLocationStatus,
  ProductLocationStatusSerialization
} from '../enumerations/product-location-status.enum';

export class McsCatalogProductLocation {
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

  @JsonProperty({ target: McsCatalogProductFacilityManager })
  public facilityManager: McsCatalogProductFacilityManager = undefined;

  @JsonProperty()
  public securityPhone: string = undefined;

  @JsonProperty()
  public hmcPhone: string = undefined;

  /**
   * Returns the complete address of the location
   */
  public get fullAddress(): string {
    let cityAddress = isNullOrEmpty(this.street) ? this.city : `${this.street} ${this.city}`;
    let addressList = [cityAddress, this.country, this.postCode];
    addressList = addressList.filter((address) => !isNullOrEmpty(address));
    return addressList.join(', ');
  }
}
