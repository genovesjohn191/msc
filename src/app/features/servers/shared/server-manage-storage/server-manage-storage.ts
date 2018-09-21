import { McsResourceStorage } from '@app/models';

export class ServerManageStorage {
  public storage: McsResourceStorage;
  public sizeMB: number;
  public valid: boolean;
  public hasChanged: boolean;
}
