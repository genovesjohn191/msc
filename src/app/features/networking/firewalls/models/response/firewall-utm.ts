import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../../../../core';
import { isNullOrEmpty } from '../../../../../utilities';

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

  /**
   * Returns true if firewall has one or more UTM service
   */
  public get hasUtmService(): boolean {
    return !isNullOrEmpty(this.avExpiryDate) || !isNullOrEmpty(this.ipsExpiryDate)
      || !isNullOrEmpty(this.emailExpiryDate) || !isNullOrEmpty(this.webExpiryDate);
  }
}
