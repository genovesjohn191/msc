import { JsonProperty } from 'json-object-mapper';
import {
  OsType,
  OsTypeSerialization
} from '../enumerations/os-type.enum';

export class McsServerCreateOs {
  public name: string;

  @JsonProperty({
    type: OsType,
    serializer: OsTypeSerialization,
    deserializer: OsTypeSerialization
  })
  public type: OsType;

  constructor() {
    this.name = undefined;
    this.type = undefined;
  }
}
