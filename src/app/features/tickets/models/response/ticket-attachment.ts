import { McsDateSerialization } from '../../../../core';
import { JsonProperty } from 'json-object-mapper';

export class TicketAttachment {
  public id: string;
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
    this.id = undefined;
    this.fileName = undefined;
    this.contentType = undefined;
    this.createdBy = undefined;
    this.createdOn = undefined;
  }
}
