import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  GoogleAnalyticsEventsService
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import { ServerMedia } from '../../../models';

@Component({
  selector: 'mcs-detach-media-dialog',
  templateUrl: './detach-media.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'detach-media-dialog-wrapper'
  }
})

export class DetachMediaDialogComponent {
  public textContent: any;
  public media: ServerMedia;

  /**
   * Dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.media)) { return ''; }
    return replacePlaceholder(
      this.textContent.title,
      'media_name',
      this.media.name
    );
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<DetachMediaDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: ServerMedia
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.detachMediaDialog;
    this.media = this.dialogData;
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('detach-media-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public detachMedia(): void {
    this._sendEventTracking('detach-media-confirm-click');
    this.dialogRef.close(this.media);
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'detach-media-dialog');
  }
}
