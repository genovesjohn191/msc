import { JsonProperty } from 'json-object-mapper';
import { CommonDefinition } from '@app/utilities';
import {
  JobStatus,
  JobStatusSerialization
} from '../enumerations/job-status.enum';
import {
  JobType,
  JobTypeSerialization,
  jobTypeText,
} from '../enumerations/job-type.enum';
import { DataStatus } from '../enumerations/data-status.enum';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsTask } from './mcs-task';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsJob extends McsEntityBase {
  public initiatorId: string;
  public initiatorFullName: string;
  public initiatorCompanyId: string;
  public initiatorCompanyName: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public elapsedTimeInSeconds: number;
  public clientReferenceObject: any;
  public batchId: string;
  public referenceId: string;

  @JsonProperty({ type: McsTask })
  public tasks: McsTask[];

  @JsonProperty({
    type: JobType,
    serializer: JobTypeSerialization,
    deserializer: JobTypeSerialization
  })
  public type: JobType;

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
    this.type = undefined;
    this.initiatorId = undefined;
    this.initiatorFullName = undefined;
    this.initiatorCompanyId = undefined;
    this.initiatorCompanyName = undefined;
    this.description = undefined;
    this.summaryInformation = undefined;
    this.errorMessage = undefined;
    this.elapsedTimeInSeconds = undefined;
    this.tasks = undefined;
    this.clientReferenceObject = undefined;
    this.batchId = undefined;
    this.status = undefined;
    this.createdOn = undefined;
    this.updatedOn = undefined;
    this.startedOn = undefined;
    this.endedOn = undefined;
    this.referenceId = undefined;
  }

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
        dataStatus = DataStatus.InProgress;
        break;
    }
    return dataStatus;
  }

  /**
   * Returns true when the job is currently in progress
   */
  public get inProgress(): boolean {
    return this.dataStatus === DataStatus.InProgress;
  }

  /**
   * Returns the data status icon key based on the status of the job
   */
  public get dataStatusIconKey(): string {
    if (this.dataStatus === DataStatus.InProgress) {
      return CommonDefinition.ASSETS_GIF_LOADER_SPINNER;
    }
    return this.dataStatus === DataStatus.Success ?
      CommonDefinition.ASSETS_SVG_SUCCESS :
      CommonDefinition.ASSETS_SVG_ERROR;
  }

  /**
   * Returns the type label of the job
   */
  public get typeLabel(): string {
    return jobTypeText[this.type];
  }

  /**
   * Returns true when the job process can be estimated
   */
  public get isEstimable(): boolean {
    return this.type !== JobType.CreateResourceCatalogItem;
  }
}
