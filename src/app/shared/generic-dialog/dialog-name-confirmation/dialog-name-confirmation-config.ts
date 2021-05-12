import { TemplateRef } from '@angular/core';

export class DialogNameConfirmationConfig {
  public title: string;
  public message: string | TemplateRef<any>;
  public name: string;
  public placeholder: string;

  public confirmText?: string;
  public cancelText?: string;
  public width?: string | 'auto';
}
