import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '../../factory/serialization/mcs-date-serialization';
import {
  McsJobStatus,
  McsJobStatusSerialization
} from '../../enumerations/mcs-job-status.enum';
import {
  McsTaskType,
  McsTaskTypeSerialization
} from '../../enumerations/mcs-task-type.enum';
import { McsDataStatus } from '../../enumerations/mcs-data-status.enum';

export class McsApiTask {
  public id: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public referenceObject: any;
  public elapsedTimeInSeconds: number;
  public ectInSeconds: number;

  @JsonProperty({
    type: McsTaskType,
    serializer: McsTaskTypeSerialization,
    deserializer: McsTaskTypeSerialization
  })
  public type: McsTaskType;

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
    this.description = undefined;
    this.summaryInformation = undefined;
    this.errorMessage = undefined;
    this.type = undefined;
    this.status = undefined;
    this.referenceObject = undefined;
    this.createdOn = undefined;
    this.updatedOn = undefined;
    this.startedOn = undefined;
    this.endedOn = undefined;
    this.elapsedTimeInSeconds = undefined;
    this.ectInSeconds = undefined;
  }

  /**
   * Returns the task data status if in progress,
   * success or error based on the task status
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
