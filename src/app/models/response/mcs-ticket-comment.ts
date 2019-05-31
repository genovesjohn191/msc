import { JsonProperty } from 'json-object-mapper';
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
  public createdBy: string;
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

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  constructor() {
    super();
    this.category = undefined;
    this.type = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
    this.value = undefined;
  }
}
