import { JsonProperty } from '@app/utilities';

import {
  Contact,
  ContactSerialization
} from '../enumerations/contact.enum';

export class McsCatalogEnquiryRequest {
  @JsonProperty()
  public notes: string = undefined;

  @JsonProperty({
    serializer: ContactSerialization,
    deserializer: ContactSerialization
  })
  public preferredContactMethod: Contact = undefined;
}
