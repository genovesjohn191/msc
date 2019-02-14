import { TemplateRef } from '@angular/core';
import { McsStatusType } from '@app/utilities';

export class DialogConfirmation<T> {
  public type?: McsStatusType = 'info';
  public title?: string;
  public confirmText?: string = 'Confirm';
  public cancelText?: string = 'Cancel';
  public message?: string | TemplateRef<any>;
  public data?: T;
}
