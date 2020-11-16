import { JsonProperty } from '@app/utilities';
import {
  TaskType,
  TaskTypeSerialization
} from '../enumerations/task-type.enum';
import {
  JobStatus,
  JobStatusSerialization,
} from '../enumerations/job-status.enum';
import { DataStatus } from '../enumerations/data-status.enum';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsTask extends McsEntityBase {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public summaryInformation: string = undefined;

  @JsonProperty()
  public errorMessage: string = undefined;

  @JsonProperty()
  public referenceObject: any = undefined;

  @JsonProperty()
  public elapsedTimeInSeconds: number = undefined;

  @JsonProperty()
  public ectInSeconds: number = undefined;

  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty({
    serializer: TaskTypeSerialization,
    deserializer: TaskTypeSerialization
  })
  public type: TaskType = undefined;

  @JsonProperty({
    serializer: JobStatusSerialization,
    deserializer: JobStatusSerialization
  })
  public status: JobStatus = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public updatedOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public startedOn: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public endedOn: Date = undefined;

  /**
   * Returns the job data status if in progress,
   * success or error based on the job status
   */
  public get dataStatus(): DataStatus {
    let dataStatus: DataStatus;

    switch (this.status) {
      case JobStatus.TimedOut:
      case JobStatus.Failed:
      case JobStatus.Cancelled:
        dataStatus = DataStatus.Error;
        break;

      case JobStatus.Completed:
        dataStatus = DataStatus.Success;
        break;

      case JobStatus.Pending:
      case JobStatus.Active:
      default:
        dataStatus = DataStatus.Active;
        break;
    }
    return dataStatus;
  }

  /**
   * Returns true when the job is currently in progress
   */
  public get inProgress(): boolean {
    return this.dataStatus === DataStatus.Active;
  }
}
