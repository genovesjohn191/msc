import { JsonProperty } from '@peerlancers/json-serialization';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsFirewallUtm {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public avExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public ipsExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public emailExpiryDate: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public webExpiryDate: Date = undefined;

  /**
   * Returns true if firewall has one or more UTM service
   */
  public get hasUtmService(): boolean {
    /**
     * TODO: Temporarily removed as per Shaun's information
     */
    // return !isNullOrEmpty(this.avExpiryDate) || !isNullOrEmpty(this.ipsExpiryDate)
    //   || !isNullOrEmpty(this.emailExpiryDate) || !isNullOrEmpty(this.webExpiryDate);
    return false;
  }
}
