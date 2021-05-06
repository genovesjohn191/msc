import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from '.';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { addToManagementToolsFormConfig } from './shared/add-to-management-tools-form.config';

export const managementToolsAddCvmForm: LaunchPadForm = {
  config: addToManagementToolsFormConfig,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    // Operating System
    let linuxOs = findCrispElementAttribute(CrispAttributeNames.Ic2LinLic , attributes)?.value;
    let notLinux = linuxOs && ((linuxOs as string).toLowerCase() === 'not');
    let selectedOs = notLinux ? 'WIN' : 'LIN';
    mappedProperties.push({ key: 'osType', value: selectedOs });

    mappedProperties.push({ key: 'deviceType', value: 'SE' });

    return mappedProperties;
  }
};

