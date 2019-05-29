import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerPasswordResetRefObj {
  serverId: string;
}

export class McsServerPasswordReset extends McsApiJobRequestBase<IMcsServerPasswordResetRefObj> { }
