import {
  ViewContainerRef,
  InjectionToken
} from '@angular/core';
import {
  McsThemeType,
  McsSizeType
} from '@app/utilities';

// Injection token definition list for dialog
export const DIALOG_DATA = new InjectionToken<any>('DialogData');
export const DIALOG_CONTAINER = new InjectionToken<any>('DialogContainerComponent');

export class DialogConfig {
  public id?: string;
  public viewContainerRef?: ViewContainerRef;
  public data?: any = null;
  public width?: string;
  public height?: string;
  public size?: McsSizeType = 'medium';
  public hasBackdrop?: boolean = true;
  public backdropColor?: McsThemeType = 'dark';
  public disableClose?: boolean = false;
}
