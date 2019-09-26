import { JsonProperty } from '@peerlancers/json-serialization';
import { McsKeyValuePair } from '../common/mcs-key-value-pair';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsIdentity {
  @JsonProperty()
  public hashedId: string = undefined;

  @JsonProperty()
  public firstName: string = undefined;

  @JsonProperty()
  public lastName: string = undefined;

  @JsonProperty()
  public userId: string = undefined;

  @JsonProperty()
  public email: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public permissions: string[] = undefined;

  @JsonProperty()
  public features: McsKeyValuePair[] = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public expiry: Date;

  /**
   * Returns the full name of the user
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
