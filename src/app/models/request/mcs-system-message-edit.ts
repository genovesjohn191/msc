import { JsonProperty } from 'json-object-mapper';
import {
  MessageType,
  MessageTypeSerialization
} from '../enumerations/message-type.enum';
import {
  Severity,
  SeveritySerialization
} from '../enumerations/severity.enum';

export class McsSystemMessageEdit {
  public message: string = undefined;
  public enabled: boolean = undefined;
  public start: string = undefined;
  public expiry: string = undefined;

  @JsonProperty({
    type: MessageType,
    serializer: MessageTypeSerialization,
    deserializer: MessageTypeSerialization
  })
  public type: MessageType = undefined;

  @JsonProperty({
    type: Severity,
    serializer: SeveritySerialization,
    deserializer: SeveritySerialization
  })
  public severity: Severity = undefined;

}
