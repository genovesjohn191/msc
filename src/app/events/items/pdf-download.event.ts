import { EventBusState } from '@app/event-bus';

export class PdfDownloadEvent extends EventBusState<void> {
  constructor() {
    super('PdfDownloadEvent');
  }
}