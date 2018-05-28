import { McsEntityBase } from '../../../../core';

export class ServerMedia extends McsEntityBase {
  public name: string;

  // Additional flag not related to API response
  public isProcessing: boolean;
  public processingText: string;

  constructor() {
    super();
    this.name = undefined;
    this.isProcessing = undefined;
    this.processingText = undefined;
  }
}
