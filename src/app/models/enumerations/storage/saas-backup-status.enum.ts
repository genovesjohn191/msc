import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupStatus {
  Stopped = 'Stopped',
  Failed = 'Failed',
  Disconnected = 'Disconnected',
  Warning = 'Warning',
  NotConfigured = 'NotConfigured',
  Success = 'Success',
  Running = 'Running',
  Queued = 'Queued',
}

export const saasBackupStatusText = {
  [SaasBackupStatus.Stopped]: 'Stopped',
  [SaasBackupStatus.Failed]: 'Failed',
  [SaasBackupStatus.Disconnected]: 'Disconnected from client',
  [SaasBackupStatus.Warning]: 'Warning',
  [SaasBackupStatus.NotConfigured]: 'Not configured',
  [SaasBackupStatus.Success]: 'Everything is backed up',
  [SaasBackupStatus.Running]: 'In Progress',
  [SaasBackupStatus.Queued]: 'Queued',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupStatusSerialization
  extends McsEnumSerializationBase<SaasBackupStatus> {
  constructor() { super(SaasBackupStatus); }
}
