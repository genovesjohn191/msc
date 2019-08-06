import { EntityRequester } from '../enumerations/entity-requester.enum';

export class McsEntityRequester {
  public id: string;
  public type: EntityRequester;
  public message?: string;
  public disabled?: boolean;
}
