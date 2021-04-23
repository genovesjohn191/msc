import { EventEmitter } from '@angular/core';

export interface GenericFormFieldComponent {
  id: string;

  label: string;

  visible: boolean;

  disabled: boolean;

  required: boolean;

  value: any;

  placeholder: string;

  onValueChanged: EventEmitter<any>;
}
