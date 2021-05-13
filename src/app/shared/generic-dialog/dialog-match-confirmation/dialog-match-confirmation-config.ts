import { TemplateRef } from '@angular/core';

export class DialogMatchConfirmationConfig {
  public title: string;
  public message: string | TemplateRef<any>;
  public valueToMatch: string;
  public placeholder: string;

  public confirmText?: string;
  public cancelText?: string;
  public width?: string | 'auto';
}
