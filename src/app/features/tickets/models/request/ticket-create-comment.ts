import {
  TicketCommentType,
  TicketCommentTypeSerialization
} from '../enumerations/ticket-comment-type';
import {
  TicketCommentCategory,
  TicketCommentCategorySerialization
} from '../enumerations/ticket-comment-category';
import { JsonProperty } from 'json-object-mapper';

export class TicketCreateComment {
  @JsonProperty({
    type: TicketCommentCategory,
    serializer: TicketCommentTypeSerialization,
    deserializer: TicketCommentTypeSerialization
  })
  public category: TicketCommentCategory;

  @JsonProperty({
    type: TicketCommentType,
    serializer: TicketCommentCategorySerialization,
    deserializer: TicketCommentCategorySerialization
  })
  public type: TicketCommentType;
  public value: string;

  constructor() {
    this.category = undefined;
    this.type = undefined;
    this.value = undefined;
  }
}
