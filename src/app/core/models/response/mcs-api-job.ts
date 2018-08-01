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
import { CoreRoutes } from '../../core.routes';
import { McsDataStatus } from '../../enumerations/mcs-data-status.enum';
import { McsEntityBase } from '../../base/mcs-entity.base';
import { McsRouteKey } from '../../enumerations/mcs-route-key.enum';

export class McsApiJob extends McsEntityBase  {
  public initiatorId: string;
  public initiatorFullName: string;
  public initiatorCompanyId: string;
  public initiatorCompanyName: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public elapsedTimeInSeconds: number;
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

  /**
   * Returns the job link based on its job type
   *
   * TODO: Need to consider links based on status.
   * Do we need to use base class and extend it?
   */
  public get link(): string {
    let jobLink: string;
    switch (this.type) {
      case McsJobType.CreateServer:
      case McsJobType.CloneServer:
        jobLink = `${CoreRoutes.getPath(McsRouteKey.ServerCreate)}/${this.id}`;
        break;

      // Add more link here when a job has requested page
      default:
        break;
    }
    return jobLink;
  }
}
