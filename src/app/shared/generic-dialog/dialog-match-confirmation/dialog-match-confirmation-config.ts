import { TemplateRef } from '@angular/core';

import { DialogActionType } from '../models/dialog-action-type';

export class DialogMatchConfirmationConfig {
  public title: string;
  public message: string | TemplateRef<any>;
  public valueToMatch: string;
  public placeholder: string;

  public type?: DialogActionType;
  public confirmText?: string;
  public cancelText?: string;
  public width?: string | 'auto';
}
