import {
  ViewContainerRef
} from '@angular/core';

export class McsDialogConfig {
  public id?: string;
  public width?: string;
  public height?: string;
  public viewContainerRef?: ViewContainerRef;
  public data?: any = null;
  public hasBackdrop?: boolean = true;
  public backdropColor?: 'none' | 'light' | 'dark' = 'dark';
}
