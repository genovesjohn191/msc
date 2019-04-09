const DEFAULT_PROCESSING_TEXT = 'Processing Request';

export abstract class McsEntityStateBase {
  public isProcessing: boolean;

  public get processingText(): string { return this.isProcessing ? this._processingText : ''; }
  public set processingText(value: string) { this._processingText = value; }
  private _processingText: string;

  constructor() {
    this.isProcessing = false;
    this._processingText = DEFAULT_PROCESSING_TEXT;
  }
}
