import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  CommentType,
  CommentTypeSerialization
} from '../enumerations/comment-type';
import {
  CommentCategory,
  CommentCategorySerialization
} from '../enumerations/comment-category';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTicketComment extends McsEntityBase {
  @JsonProperty()
  public createdBy: string = undefined;

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

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;
}
