import { JsonProperty } from 'json-object-mapper';
import {
  CommentType,
  CommentTypeSerialization
} from '../enumerations/comment-type';
import {
  CommentCategory,
  CommentCategorySerialization
} from '../enumerations/comment-category';

export class McsTicketCreateComment {
  public value: string;

  @JsonProperty({
    type: CommentCategory,
    serializer: CommentCategorySerialization,
    deserializer: CommentCategorySerialization
  })
  public category: CommentCategory;

  @JsonProperty({
    type: CommentType,
    serializer: CommentTypeSerialization,
    deserializer: CommentTypeSerialization
  })
  public type: CommentType;

  constructor() {
    this.category = undefined;
    this.type = undefined;
    this.value = undefined;
  }
}
