import {
  IJsonObject,
  McsSizeType
} from '@app/utilities';

export interface IFormField {
  id?: string;
  suffix?: string;
  prefix?: string;
  startHint?: string;
  endHint?: string;
  disabledElement?: boolean;
  readonlyElement?: boolean;
  label?: string;
  size?: McsSizeType;
  interpolations?: IJsonObject;

  includeNone?: boolean;
}
