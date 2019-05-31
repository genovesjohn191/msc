import { JsonProperty } from 'json-object-mapper';
import { McsKeyValuePair } from '../common/mcs-key-value-pair';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsIdentity {
  public hashedId: string;
  public firstName: string;
  public lastName: string;
  public userId: string;
  public email: string;
  public companyId: string;
  public companyName: string;
  public permissions: string[];
  public features: McsKeyValuePair[];

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public expiry: Date;

  constructor() {
    this.hashedId = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.userId = undefined;
    this.email = undefined;
    this.companyId = undefined;
    this.companyName = undefined;
    this.expiry = undefined;
    this.permissions = undefined;
    this.features = undefined;
  }

  /**
   * Returns the full name of the user
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
