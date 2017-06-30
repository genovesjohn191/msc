import { McsApiTask } from './mcs-api-task';

export class McsApiJob {
  public id: string;
  public type: number;
  public ownerName: string;
  public description: string;
  public summaryInformation: string;
  public errorMessage: string;
  public durationInSeconds: number;
  public ectInSeconds: number;
  public tasks: McsApiTask[];
  public clientReferenceObject: any;
  public status: string;
  public createdOn: Date;
  public updatedOn: Date;
  public startedOn: Date;
  public endedOn: Date;
}
