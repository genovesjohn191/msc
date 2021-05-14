import { TemplateRef } from '@angular/core';

import { DialogActionType } from '../models';

export class DialogConfirmationConfig2 {
  public title: string;
  public message: string | TemplateRef<any>;

  public type?: DialogActionType;
  public confirmText?: string;
  public cancelText?: string;
  public data?: any;
  public width?: string | 'auto';
}
