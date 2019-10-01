import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerOsUpdatesInspectRequestRefObj {
  serverId: string;
}

export class McsServerOsUpdatesInspectRequest extends McsApiJobRequestBase<IMcsServerOsUpdatesInspectRequestRefObj> {}
