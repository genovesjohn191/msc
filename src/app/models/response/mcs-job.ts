import { JsonProperty } from 'json-object-mapper';
import { isNullOrEmpty, getSafeProperty } from '@app/utilities';
import {
  CoreRoutes,
  McsDateSerialization,
  CoreDefinition
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
  public batchId: string;

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
      return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
    }
    return this.dataStatus === DataStatus.Success ?
      CoreDefinition.ASSETS_SVG_SUCCESS :
      CoreDefinition.ASSETS_SVG_ERROR;
  }

  /**
   * Returns the job link based on its job type
   * @deprecated Use the resourceLink instead because we are
   * removing this property when the job page details is finished
   */
  public get link(): string {
    let jobLink: string = '';
    switch (this.type) {
      case JobType.CreateServer:
      case JobType.CloneServer:
        // case JobType.CreateResourceCatalogItem:
        // TODO: Remove comment this once the job details page is finished
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

  /**
   * Returns the resource link based on the task provided
   */
  public get resourceLink(): string {
    let completedTask = this.tasks && this.tasks.find((task) => {
      return task.dataStatus === DataStatus.Success
        && !isNullOrEmpty(task.referenceObject);
    });
    let resourceDynamicPath = getSafeProperty(
      this.clientReferenceObject, (obj) => obj.resourcePath
    );

    // TODO: Temporarily force the compute/virtual since the job is not
    // sending back the resourcePath when creating managed server
    resourceDynamicPath = isNullOrEmpty(resourceDynamicPath) ?
      `/compute/virtual` : resourceDynamicPath;
    let resourceId = getSafeProperty(completedTask, (obj) => obj.referenceObject.resourceId);
    return !isNullOrEmpty(resourceId) ? `${resourceDynamicPath}/${resourceId}` : undefined;
  }
}
