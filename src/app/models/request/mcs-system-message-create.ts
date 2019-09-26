import { JsonProperty } from '@peerlancers/json-serialization';
import {
  MessageType,
  MessageTypeSerialization
} from '../enumerations/message-type.enum';
import {
  Severity,
  SeveritySerialization
} from '../enumerations/severity.enum';

export class McsSystemMessageCreate {
  @JsonProperty()
  public message: string = undefined;

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public start: string = undefined;

  @JsonProperty()
  public expiry: string = undefined;

  @JsonProperty({
    serializer: MessageTypeSerialization,
    deserializer: MessageTypeSerialization
  })
  public type: MessageType = undefined;

  @JsonProperty({
    serializer: SeveritySerialization,
    deserializer: SeveritySerialization
  })
  public severity: Severity = undefined;
}
