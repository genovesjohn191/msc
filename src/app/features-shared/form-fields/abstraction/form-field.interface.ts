import { McsSizeType } from '@app/utilities';

export interface IFormField {
  id?: string;
  disabledElement?: boolean;
  label?: string;
  size?: McsSizeType;

  includeNone?: boolean;
}
