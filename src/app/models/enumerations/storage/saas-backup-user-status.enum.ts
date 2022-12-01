import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupUserStatus {
  Failure = 'Failure',
  Success = 'Success'
}

export const saasBackupUserStatusText = {
  [SaasBackupUserStatus.Failure]: 'Failure',
  [SaasBackupUserStatus.Success]: 'Success'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupUserStatusSerialization
  extends McsEnumSerializationBase<SaasBackupUserStatus> {
  constructor() { super(SaasBackupUserStatus); }
}
