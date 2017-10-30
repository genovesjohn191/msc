import {
  ViewContainerRef
} from '@angular/core';

export class McsDialogConfig {
  public id?: string;
  public viewContainerRef?: ViewContainerRef;
  public data?: any = null;
  public width?: string;
  public height?: string;
  public size?: 'auto' | 'small' | 'medium' | 'large' = 'auto';
  public hasBackdrop?: boolean = true;
  public backdropColor?: 'none' | 'light' | 'dark' = 'dark';
  public disableClose?: boolean = false;
}
