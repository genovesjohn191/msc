import { McsObjectCrispElementServiceAttribute } from '@app/models';

export enum CrispAttributeNames {
  AvailabilityZone = 'AVAILABILITY_ZONE',
  AvdCspConsSrvc= 'AVD_CSP_CONS_SRVC',
  LinkedServiceAz = 'LINKED_SERVICE_AZ',
  BaasRetentionReq = 'BAAS_RETENTION_REQ',
  BillFreq = 'BILL_FREQ',
  DailyBackupQuota = 'DAILY-BACKUP-QUOTA',
  DedicatedProvVdc = 'DEDICATED_PROV_VDC',
  DesignatedUsage = 'DESIGNATED_USAGE',
  FirewallType = 'FWALL_TYPE',
  HipsProtectionLvl = 'HIPS_PROTECTION_LVL',
  Ic2Access = 'IC2_ACCESS',
  Ic2DiskSpace = 'IC2_DISK_SPACE',
  Ic2Ip = 'IC2_IP',
  Ic2LinLic = 'IC2_LINLIC',
  Ic2Ram = 'IC2_RAM',
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
  LinkSrvMaza = 'LINK_SRV_MAZA',
  MazaDiskSpace2 = 'MAZA_DISK_SPACE2',
  MazaLocation = 'MAZA_LOCATION',
  MazaStorageTier = 'MAZA_STORAGE_TIER',
  NoVcores = 'NO_VCORES',
  ProductId = 'PRODUCT_ID',
  ProvisionQuotaGib = 'PROVISION_QUOTA_GIB',
  ProvisionQuotaGib2 = 'PROVISION_QUOTA_GIB2',
  Quantity = 'QUANTITY',
  ReservedTerm = 'RESERVED_TERM',
  ServerLink = 'SERVER_LINK',
  SkuId = 'SKU_ID',
  UseCase = 'USE_CASE',
  VdcAlwysOnRam = 'VDC_ALWYS_ON_RAM',
  VdcAlwysOnVcore = 'VDC_ALWYS_ON_VCORE',
  VdcNoVcores = 'VDC_NO_VCORES',
  VdcRam = 'VDC_RAM'
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