import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../../../../core';

export class FirewallUtm {
  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public avExpiryDate: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public ipsExpiryDate: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public emailExpiryDate: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public webExpiryDate: Date;

  constructor() {
    this.avExpiryDate = undefined;
    this.ipsExpiryDate = undefined;
    this.emailExpiryDate = undefined;
    this.webExpiryDate = undefined;
  }
}
