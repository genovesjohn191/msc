import { McsNotificationTask } from './mcs-notification-task';

export class McsNotification {
  public id: string;
  public userId: string;
  public jobDefinitionId: string;
  public serviceId: string;
  public createdOn: Date;
  public startedOn: Date;
  public updatedOn: Date;
  public endedOn: Date;
  public status: string;
  public summaryInformation: string;
  public tasks: McsNotificationTask[];
  public durationInSeconds: number;
  public description: string;
}
