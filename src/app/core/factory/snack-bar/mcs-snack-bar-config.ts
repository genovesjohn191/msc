import { ViewContainerRef } from '@angular/core';
import {
  McsPlacementType,
  McsAlignmentType
} from '../../core.types';

export class McsSnackBarConfig {
  public id?: string;
  public data?: any = null;
  public viewContainerRef?: ViewContainerRef;
  public duration?: number = null;
  public verticalPlacement: McsPlacementType = 'bottom';
  public horizontalAlignment: McsAlignmentType = 'start';
  public customClass?: string;
}
