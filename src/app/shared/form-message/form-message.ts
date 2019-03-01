import { McsStatusType } from '@app/utilities';
import { FormMessageConfig } from './form-message.config';

export interface FormMessageContent {
  messages?: string | string[];
  fallbackMessage?: string;
}

export interface FormMessage {
  showMessage(type: McsStatusType, messageContent: FormMessageContent): void;
  hideMessage(): void;
  updateConfiguration(config: FormMessageConfig): void;
}
