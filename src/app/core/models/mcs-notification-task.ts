export class McsNotificationTask {
  public id: string;
  public jobId: string;
  public prerequisiteTaskId: string;
  public taskDefinitionId: string;
  public startedOn: Date;
  public createdOn: Date;
  public updatedOn: Date;
  public endedOn: Date;
  public status: string;
  public summaryInformation: string;
  public durationInSeconds: number;
  public description: string;
}
