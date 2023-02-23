import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupStatus {
  PartialSuccess = 'PartialSuccess',
  Warning = 'Warning',
  Failure = 'Failure',
  Success = 'Success',
  Running = 'Running',
}

export const saasBackupStatusText = {
  [SaasBackupStatus.PartialSuccess]: 'Completed with Warnings',
  [SaasBackupStatus.Warning]: 'Completed with Warnings',
  [SaasBackupStatus.Failure]: 'Failure',
  [SaasBackupStatus.Success]: 'Success',
  [SaasBackupStatus.Running]: 'Running'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupStatusSerialization
  extends McsEnumSerializationBase<SaasBackupStatus> {
  constructor() { super(SaasBackupStatus); }
}
