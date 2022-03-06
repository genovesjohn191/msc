import { InjectionToken } from '@angular/core';
import { McsSizeType } from '@app/utilities';

export const MCS_SIDESHEET_DATA = new InjectionToken<any>('MCS_SIDESHEET_DATA');
export const MCS_SIDESHEET_CONTAINER = new InjectionToken<any>('MCS_SIDESHEET_CONTAINER');

export class SideSheetConfig {
  public id?: string;
  public title?: string;
  public data?: any;
  public size?: McsSizeType;

  public hasBackdrop?: boolean;
  public backdropClass?: string;
}
