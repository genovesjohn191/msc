import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';

export interface LaunchPadForm {
  config: DynamicFormFieldDataBase[];

  crispElementConverter?: (attributes: McsObjectCrispElementServiceAttribute[]) => { key: string, value: any }[]
}
