import { TemplateRef } from '@angular/core';
import { McsStatusType } from '@app/utilities';

export class DialogConfirmation<T> {
  public type?: McsStatusType = 'info';
  public title?: string;
  public message?: string | TemplateRef<any>;
  public data?: T;
}
