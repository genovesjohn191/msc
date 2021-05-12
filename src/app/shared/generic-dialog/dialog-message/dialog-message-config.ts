import { TemplateRef } from '@angular/core';

import { DialogActionType } from '../models';

export class DialogMessageConfig2 {
  public type: DialogActionType = DialogActionType.Info;
  public title: string;
  public message: string | TemplateRef<any>;

  public okText?: string;
  public width?: string | 'auto';
}
