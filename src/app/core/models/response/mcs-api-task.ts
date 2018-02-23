import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../factory/serialization/mcs-date-serialization';

export class McsApiTask {
  public id: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public status: string;
  public referenceObject: any;
  public durationInSeconds: number;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public startedOn: Date;

  @JsonProperty({
    type: Date,
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public endedOn: Date;

  constructor() {
    this.id = undefined;
    this.description = undefined;
    this.summaryInformation = undefined;
    this.errorMessage = undefined;
    this.status = undefined;
    this.referenceObject = undefined;
    this.durationInSeconds = undefined;
    this.createdOn = undefined;
    this.updatedOn = undefined;
    this.startedOn = undefined;
    this.endedOn = undefined;
  }
}
