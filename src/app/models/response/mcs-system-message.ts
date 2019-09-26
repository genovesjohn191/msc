import { JsonProperty } from '@peerlancers/json-serialization';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  MessageType,
  MessageTypeSerialization,
  messageTypeText
} from '../enumerations/message-type.enum';
import {
  Severity,
  SeveritySerialization,
  severityText
} from '../enumerations/severity.enum';

export class McsSystemMessage extends McsEntityBase {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty()
  public updatedBy: string = undefined;

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public message: string = undefined;

  @JsonProperty()
  public active: boolean = undefined;

  @JsonProperty({ target: McsSystemMessage })
  public childSystemMessages: McsSystemMessage[] = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public start: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public expiry: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;

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

  /**
   * Returns the message type label
   */
  public get typeLabel(): string {
    return messageTypeText[this.type];
  }

  /**
   * Returns the severity label
   */
  public get severityLabel(): string {
    return severityText[this.severity];
  }

  /**
   * Returns the enabled label
   */
  public get enabledLabel(): string {
    /**
     * TODO: In future, we can still improve this
     * by using icons for frontend instead of enabled/disabled
     */
    return (this.enabled) ? 'Enabled' : 'Disabled';
  }

  /**
   * Returns true if the severity is Critical, false otherwise
   */
  public get isCritical(): boolean {
    return this.severity === Severity.Critical;
  }

}
