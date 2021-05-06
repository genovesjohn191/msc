import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { backupProvisionFormConfig } from './shared/backup-provision.form.config';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vmBackupProvisionForm: LaunchPadForm = {
  config: backupProvisionFormConfig,

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'server',
      value: findCrispElementAttribute(CrispAttributeNames.LinkedServiceId, attributes)?.displayValue } );

    mappedProperties.push({ key: 'backupAggregationTarget',
      value: findCrispElementAttribute(CrispAttributeNames.IntelliDeuNominatedBackup, attributes)?.displayValue } );

    mappedProperties.push({ key: 'retentionPeriodInDays',
      value: findCrispElementAttribute(CrispAttributeNames.BaasRetentionReq, attributes)?.value } );

    mappedProperties.push({ key: 'dailyQuotaInGB',
      value: findCrispElementAttribute(CrispAttributeNames.DailyBackupQuota, attributes)?.value } );

    return mappedProperties;
  }
}
