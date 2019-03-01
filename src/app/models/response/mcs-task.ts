import { JsonProperty } from 'json-object-mapper';
import { McsDateSerialization } from '@app/core';
import {
  TaskType,
  TaskTypeSerialization
} from '../enumerations/task-type.enum';
import {
  JobStatus,
  JobStatusSerialization,
} from '../enumerations/job-status.enum';
import { DataStatus } from '../enumerations/data-status.enum';
import { McsEntityBase } from '../mcs-entity.base';

export class McsTask extends McsEntityBase {
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public referenceObject: any;
  public elapsedTimeInSeconds: number;
  public ectInSeconds: number;

  @JsonProperty({
    type: TaskType,
    serializer: TaskTypeSerialization,
    deserializer: TaskTypeSerialization
  })
  public type: TaskType;

  @JsonProperty({
    type: JobStatus,
    serializer: JobStatusSerialization,
    deserializer: JobStatusSerialization
  })
  public status: JobStatus;

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
    super();
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
        dataStatus = DataStatus.InProgress;
        break;
    }
    return dataStatus;
  }
}
