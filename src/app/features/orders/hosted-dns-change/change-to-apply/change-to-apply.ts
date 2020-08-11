import { DnsRecordType } from '@app/models';

export enum ActionType {
  Add = 'Add',
  Remove = 'Remove'
}

export class ChangeToApply {
  recordType: DnsRecordType;
  hostName: string;
  target: string;
  priority?: number;
  ttlSeconds: number;
}
