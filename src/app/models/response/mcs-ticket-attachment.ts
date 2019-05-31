import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTicketAttachment extends McsEntityBase {
  public fileName: string;
  public contentType: string;
  public createdBy: string;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  constructor() {
    super();
    this.fileName = undefined;
    this.contentType = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
  }
}
