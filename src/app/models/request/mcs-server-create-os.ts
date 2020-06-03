import { JsonProperty } from '@app/utilities';
import {
  OsType,
  OsTypeSerialization
} from '../enumerations/os-type.enum';

export class McsServerCreateOs {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: OsTypeSerialization,
    deserializer: OsTypeSerialization
  })
  public type: OsType = undefined;
}
