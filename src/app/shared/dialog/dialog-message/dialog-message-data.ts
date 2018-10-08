import { TemplateRef } from '@angular/core';
import { McsStatusType } from '@app/utilities';

export class DialogMessageData {
  public type: McsStatusType = 'warning';
  public title?: string;
  public message?: string | TemplateRef<any>;
}
