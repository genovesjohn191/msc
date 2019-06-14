import { ViewContainerRef } from '@angular/core';
import {
  McsPlacementType,
  McsAlignmentType,
  McsThemeType
} from '@app/utilities';

export class SnackBarConfig {
  public id?: string;
  public data?: any = null;
  public viewContainerRef?: ViewContainerRef;
  public duration?: number = null;
  public theme?: McsThemeType = 'dark';
  public verticalPlacement?: McsPlacementType = 'bottom';
  public horizontalAlignment?: McsAlignmentType = 'start';
  public customClass?: string;
}
