import { McsStatusType } from '@app/utilities';

export interface FormMessageContent {
  messages?: string | string[];
  fallbackMessage?: string;
}

export interface FormMessage {
  showMessage(type: McsStatusType, messageContent: FormMessageContent): void;
  hideMessage(): void;
}
