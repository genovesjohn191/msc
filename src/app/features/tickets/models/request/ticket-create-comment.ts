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
  public value: string;

  @JsonProperty({
    type: TicketCommentCategory,
    serializer: TicketCommentCategorySerialization,
    deserializer: TicketCommentCategorySerialization
  })
  public category: TicketCommentCategory;

  @JsonProperty({
    type: TicketCommentType,
    serializer: TicketCommentTypeSerialization,
    deserializer: TicketCommentTypeSerialization
  })
  public type: TicketCommentType;

  constructor() {
    this.category = undefined;
    this.type = undefined;
    this.value = undefined;
  }
}
