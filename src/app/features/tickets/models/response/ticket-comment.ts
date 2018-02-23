import { McsDateSerialization } from '../../../../core';
import {
  TicketCommentType,
  TicketCommentTypeSerialization
} from '../enumerations/ticket-comment-type';
import {
  TicketCommentCategory,
  TicketCommentCategorySerialization
} from '../enumerations/ticket-comment-category';
import { JsonProperty } from 'json-object-mapper';

export class TicketComment {
  public id: string;
  public createdBy: string;
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

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  constructor() {
    this.id = undefined;
    this.category = undefined;
    this.type = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
    this.value = undefined;
  }
}
