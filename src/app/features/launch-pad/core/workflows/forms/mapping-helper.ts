import { McsObjectCrispElementServiceAttribute } from '@app/models';

export enum CrispAttributeNames {
  BaasRetentionReq = 'BAAS_RETENTION_REQ',
  DailyBackupQuota = 'DAILY-BACKUP-QUOTA',
  DesignatedUsage = 'DESIGNATED_USAGE',
  HidsProtectionLvl = 'HIPS_PROTECTION_LVL',
  Ic2Access = 'IC2_ACCESS',
  Ic2DiskSpace = 'IC2_DISK_SPACE',
  Ic2Ip = 'IC2_IP',
  Ic2LinLic = 'IC2_LINLIC',
  Ic2Server = 'IC2_SERVER',
  Ic2Storage = 'IC2_STORAGE',
  Ic2StorageTier = 'IC2_STORAGE_TIER',
  Ic2Vcpu = 'IC2_VCPU',
  Ic2Vram = 'IC2_VRAM',
  Ic2WinLic = 'IC2_WINLIC',
  IntelliDeuNominatedBackup = 'INTELLI-DEU-NOMINATED-BACKUP',
  LinkedServiceId = 'LINKED_SERVICEID',
  LinkSrvIdVav = 'LINK_SRV_ID_VAV',
  ServerLink = 'SERVER_LINK',
}

export const findCrispElementAttribute:
(key: CrispAttributeNames, payload: McsObjectCrispElementServiceAttribute[]) => McsObjectCrispElementServiceAttribute =
(key, payload) => {
  return payload.find((prop) => prop.code === key);
};

// TODO: Map multiple values into one result
export const findCrispElementMultiValueAttribute:
(key: CrispAttributeNames, payload: McsObjectCrispElementServiceAttribute[]) => McsObjectCrispElementServiceAttribute =
(key, payload) => {
  return {
    code: 'TODO',
    displayValue: 'TODO',
    value: ['TODO'],
  }
};