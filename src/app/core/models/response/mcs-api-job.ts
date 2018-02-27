import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../factory/serialization/mcs-date-serialization';
import { McsApiTask } from './mcs-api-task';
import {
  McsJobType,
  McsJobTypeSerialization
} from '../../enumerations/mcs-job-type.enum';

// TODO: Set the jobtype to its corresponding enum type instead of string
// this a major modification and needs alot of effort. :)
export class McsApiJob {
  public id: string;
  public ownerName: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public durationInSeconds: number;
  public ectInSeconds: number;
  public clientReferenceObject: any;
  public status: string;

  @JsonProperty({ type: McsApiTask })
  public tasks: McsApiTask[];

  @JsonProperty({
    type: McsJobType,
    serializer: McsJobTypeSerialization,
    deserializer: McsJobTypeSerialization
  })
  public type: McsJobType;

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
    this.type = undefined;
    this.ownerName = undefined;
    this.description = undefined;
    this.summaryInformation = undefined;
    this.errorMessage = undefined;
    this.durationInSeconds = undefined;
    this.ectInSeconds = undefined;
    this.tasks = undefined;
    this.clientReferenceObject = undefined;
    this.status = undefined;
    this.createdOn = undefined;
    this.updatedOn = undefined;
    this.startedOn = undefined;
    this.endedOn = undefined;
  }
}
