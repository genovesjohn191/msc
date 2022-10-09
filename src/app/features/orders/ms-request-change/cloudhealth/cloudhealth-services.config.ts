import { McsOption } from "@app/models";

export enum CHAlertFieldType {
  Dropdown = 0,
  Checkbox = 1,
  Input = 2
}

export enum CHAlertInputType {
  Text = 'text',
  Number = 'number',
  Email = 'email'
}

export interface CloudHealthPeriodRange {
  from: Date;
  until: Date;
}

export interface CHAlertInfo {
  description: string;
  actionLabel: string;
  controlType: CHAlertFieldType;
  inputType?: CHAlertInputType;
}