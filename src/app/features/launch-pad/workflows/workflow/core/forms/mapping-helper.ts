import { McsObjectCrispElementServiceAttribute } from '@app/models';

export enum CrispAttributeNames {
  AvdCspConsSrvc= 'AVD_CSP_CONS_SRVC',
  BaasRetentionReq = 'BAAS_RETENTION_REQ',
  BillFreq = 'BILL_FREQ',
  DailyBackupQuota = 'DAILY-BACKUP-QUOTA',
  DesignatedUsage = 'DESIGNATED_USAGE',
  FirewallType = 'FWALL_TYPE',
  HipsProtectionLvl = 'HIPS_PROTECTION_LVL',
  Ic2Access = 'IC2_ACCESS',
  Ic2DiskSpace = 'IC2_DISK_SPACE',
  Ic2Ip = 'IC2_IP',
  Ic2LinLic = 'IC2_LINLIC',
  Ic2Server = 'IC2_SERVER',
  Ic2Storage = 'IC2_STORAGE',
  Ic2StorageTier = 'IC2_STORAGE_TIER',
  Ic2Vcpu = 'IC2_VCPU',
  Ic2Version = 'IC2_VERSION',
  Ic2Vram = 'IC2_VRAM',
  Ic2WinLic = 'IC2_WINLIC',
  IntelliDeuNominatedBackup = 'INTELLI-DEU-NOMINATED-BACKUP',
  LinkedConsService = 'LINKED_CONS_SERVICE',
  LinkedServiceId = 'LINKED_SERVICEID',
  LinkedMsTenant = 'LINKED_MS_TENANT',
  LinkSrvIdVav = 'LINK_SRV_ID_VAV',
  ProductId = 'PRODUCT_ID',
  Quantity = 'QUANTITY',
  ReservedTerm = 'RESERVED_TERM',
  ServerLink = 'SERVER_LINK',
  SkuId = 'SKU_ID',
  UseCase = 'USE_CASE'
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