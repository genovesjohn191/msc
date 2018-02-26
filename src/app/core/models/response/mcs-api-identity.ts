import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../factory/serialization/mcs-date-serialization';

export class McsApiIdentity {
  public hashedId: string;
  public firstName: string;
  public lastName: string;
  public userId: string;
  public email: string;
  public companyId: string;
  public companyName: string;
  public permissions: string[];

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
  }
}
