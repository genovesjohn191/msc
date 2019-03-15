import { McsFormGroupDirective } from '@app/shared';

export interface IMcsFormGroup {
  getFormGroup(): McsFormGroupDirective;
  isValid(): boolean;
}
