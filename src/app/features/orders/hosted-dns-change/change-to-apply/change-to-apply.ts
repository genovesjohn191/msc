import { DnsRecordType } from '@app/models';

export enum ActionType {
  Add = 'Add',
  Remove = 'Remove'
}

export class ChangeToApply {
  action: string;
  type: DnsRecordType;
  hostName: string;
  value: string;
  priority?: number;
  ttlSeconds: number;
}
