import { TemplateRef } from '@angular/core';
import { McsStatusType } from '@app/utilities';

export class DialogMessageConfig {
  public type: McsStatusType = 'warning';
  public title?: string;
  public message?: string | TemplateRef<any>;
  public okText?: string = 'OK';
}
