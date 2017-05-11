import { McsNotificationTask } from './mcs-notification-task';

export class McsNotification {
  public id: string;
  public ownerId: string;
  public accountId: string;
  public errorMessage: string;
  public jobDefinitionId: string;
  public createdOn: Date;
  public startedOn: Date;
  public updatedOn: Date;
  public endedOn: Date;
  public status: string;
  public summaryInformation: string;
  public ownerName: string;
  public durationInSeconds: number;
  public description: string;
}
