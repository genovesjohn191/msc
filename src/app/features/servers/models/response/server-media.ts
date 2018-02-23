export class ServerMedia {
  public id: any;
  public name: string;

  // Additional flag not related to API response
  public isProcessing: boolean;
  public processingText: string;

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.isProcessing = undefined;
    this.processingText = undefined;
  }
}
