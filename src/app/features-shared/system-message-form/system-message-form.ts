import {
  MessageType,
  Severity
} from '@app/models';

export class SystemMessageForm {
  public start: string;
  public expiry: string;
  public message: string;
  public type: MessageType;
  public severity: Severity;
  public enabled: boolean;
  public valid: boolean;
  public hasChanged: boolean;
}
