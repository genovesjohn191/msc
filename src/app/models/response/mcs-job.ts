import { JsonProperty } from 'json-object-mapper';
import { isNullOrEmpty } from '@app/utilities';
import {
  CoreRoutes,
  McsDateSerialization
} from '@app/core';
import {
  JobStatus,
  JobStatusSerialization
} from '../enumerations/job-status.enum';
import {
  JobType,
  JobTypeSerialization,
} from '../enumerations/job-type.enum';
import { RouteKey } from '../enumerations/route-key.enum';
import { DataStatus } from '../enumerations/data-status.enum';
import { McsEntityBase } from '../mcs-entity.base';
import { McsTask } from './mcs-task';

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
  public get dataStatus(): DataStatus {
    let dataStatus: DataStatus;

    switch (this.status) {
      case JobStatus.Timedout:
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
   * Returns the job link based on its job type
   *
   * TODO: Need to consider links based on status.
   * Do we need to use base class and extend it?
   */
  public get link(): string {
    let jobLink: string = '';
    switch (this.type) {
      case JobType.CreateServer:
      case JobType.CloneServer:
        jobLink = `
          ${CoreRoutes.getNavigationPath(RouteKey.ServerCreateProvisioning)}/${this.id}
        `;
        break;

      // Add more link here when a job has requested page
      default:
        break;
    }
    return jobLink.trim();
  }

  /**
   * Returns true when the job has link url
   */
  public get hasLink(): boolean {
    return !isNullOrEmpty(this.link);
  }
}
