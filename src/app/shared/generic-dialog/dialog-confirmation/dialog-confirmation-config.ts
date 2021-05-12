import { TemplateRef } from '@angular/core';

import { DialogActionType } from '../models';

export class DialogConfirmationConfig2 {
  public type: DialogActionType = DialogActionType.Warning;
  public title: string;
  public message: string | TemplateRef<any>;

  public confirmText?: string;
  public cancelText?: string;
  public data?: any;
  public width?: string | 'auto';
}
