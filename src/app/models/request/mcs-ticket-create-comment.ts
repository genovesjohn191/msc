import { JsonProperty } from '@peerlancers/json-serialization';
import {
  CommentType,
  CommentTypeSerialization
} from '../enumerations/comment-type';
import {
  CommentCategory,
  CommentCategorySerialization
} from '../enumerations/comment-category';

export class McsTicketCreateComment {
  @JsonProperty()
  public value: string = undefined;

  @JsonProperty({
    serializer: CommentCategorySerialization,
    deserializer: CommentCategorySerialization
  })
  public category: CommentCategory = undefined;

  @JsonProperty({
    serializer: CommentTypeSerialization,
    deserializer: CommentTypeSerialization
  })
  public type: CommentType = undefined;
}
