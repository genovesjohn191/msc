import { McsSizeType } from '@app/utilities';

export interface IFormField {
  id?: string;
  disabledElement?: boolean;
  readonlyElement?: boolean;
  label?: string;
  size?: McsSizeType;

  includeNone?: boolean;
}
