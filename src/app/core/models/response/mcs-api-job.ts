import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../factory/serialization/mcs-date-serialization';
import { McsApiTask } from './mcs-api-task';
import {
  McsJobType,
  McsJobTypeSerialization
} from '../../enumerations/mcs-job-type.enum';
import {
  McsJobStatus,
  McsJobStatusSerialization
} from '../../enumerations/mcs-job-status.enum';
import { McsDataStatus } from '../../enumerations/mcs-data-status.enum';

export class McsApiJob {
  public id: string;
  public ownerId: string;
  public ownerName: string;
  public ownerCompanyId: string;
  public ownerCompanyName: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public durationInSeconds: number;
  public ectInSeconds: number;
  public clientReferenceObject: any;

  @JsonProperty({ type: McsApiTask })
  public tasks: McsApiTask[];

  @JsonProperty({
    type: McsJobType,
    serializer: McsJobTypeSerialization,
    deserializer: McsJobTypeSerialization
  })
  public type: McsJobType;

  @JsonProperty({
    type: McsJobStatus,
    serializer: McsJobStatusSerialization,
    deserializer: McsJobStatusSerialization
  })
  public status: McsJobStatus;

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
    this.ownerId = undefined;
    this.ownerName = undefined;
    this.ownerCompanyId = undefined;
    this.ownerCompanyName = undefined;
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

  /**
   * Returns the job data status if in progress,
   * success or error based on the job status
   */
  public get dataStatus(): McsDataStatus {
    let dataStatus: McsDataStatus;

    switch (this.status) {
      case McsJobStatus.Timedout:
      case McsJobStatus.Failed:
      case McsJobStatus.Cancelled:
        dataStatus = McsDataStatus.Error;
        break;

      case McsJobStatus.Completed:
        dataStatus = McsDataStatus.Success;
        break;

      case McsJobStatus.Pending:
      case McsJobStatus.Active:
      default:
        dataStatus = McsDataStatus.InProgress;
        break;
    }
    return dataStatus;
  }
}
