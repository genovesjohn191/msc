import { JsonProperty } from 'json-object-mapper';
import { McsKeyValuePair } from '@app/models';
import { McsDateSerialization } from '@app/core';

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
}
