import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface McsServerRenameRefObj {
  serverId: string;
}

export class McsServerRename extends McsApiJobRequestBase<McsServerRenameRefObj> {
  public name: string = undefined;
}
