import {
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { DataStatus } from '../enumerations/data-status.enum';
import {
  JobStatus,
  JobStatusSerialization
} from '../enumerations/job-status.enum';
import {
  jobTypeText,
  JobType,
  JobTypeSerialization
} from '../enumerations/job-type.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import { McsTask } from './mcs-task';

export class McsJob extends McsEntityBase {
  @JsonProperty()
  public initiatorId: string = undefined;

  @JsonProperty()
  public initiatorFullName: string = undefined;

  @JsonProperty()
  public initiatorCompanyId: string = undefined;

  @JsonProperty()
  public initiatorCompanyName: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public summaryInformation: string = undefined;

  @JsonProperty()
  public errorMessage: string = undefined;

  @JsonProperty()
  public elapsedTimeInSeconds: number = undefined;

  @JsonProperty()
  public clientReferenceObject: any = undefined;

  @JsonProperty()
  public batchId: string = undefined;

  @JsonProperty()
  public targetCompanyName: string = undefined;

  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty({ target: McsTask })
  public tasks: McsTask[] = undefined;

  @JsonProperty({
    serializer: JobTypeSerialization,
    deserializer: JobTypeSerialization
  })
  public type: JobType = undefined;

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

  @JsonProperty()
  public orchestrationId: string = undefined;

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

  /**
   * Returns the data status icon key based on the status of the job
   */
  public get dataStatusIconKey(): string {
    if (this.dataStatus === DataStatus.Active) {
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
    return this.type !== JobType.ResourceCreateCatalogItem;
  }
}
