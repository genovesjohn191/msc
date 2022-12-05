import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum SaasBackupUserStatus {
  Protected = 'Protected',
  Unprotected = 'Unprotected'
}

export const saasBackupUserStatusText = {
  [SaasBackupUserStatus.Protected]: 'Protected',
  [SaasBackupUserStatus.Unprotected]: 'Unprotected'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class SaasBackupUserStatusSerialization
  extends McsEnumSerializationBase<SaasBackupUserStatus> {
  constructor() { super(SaasBackupUserStatus); }
}
