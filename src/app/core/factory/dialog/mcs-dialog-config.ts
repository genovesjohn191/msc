import { ViewContainerRef } from '@angular/core';
import {
  McsThemeType,
  McsSizeType
} from '@app/utilities';

export class McsDialogConfig {
  public id?: string;
  public viewContainerRef?: ViewContainerRef;
  public data?: any = null;
  public width?: string;
  public height?: string;
  public size?: McsSizeType = 'auto';
  public hasBackdrop?: boolean = true;
  public backdropColor?: McsThemeType = 'dark';
  public disableClose?: boolean = false;
}
