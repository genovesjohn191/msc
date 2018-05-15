import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  CoreDefinition,
  GoogleAnalyticsEventsService
} from '../../../../../core';
import { replacePlaceholder } from '../../../../../utilities';
import { ServerSnapshotDialogContent } from '../../../models';

@Component({
  selector: 'mcs-insufficient-storage-snapshot-dialog',
  templateUrl: './insufficient-storage-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'insufficient-storage-snapshot-dialog-wrapper'
  }
})

export class InsufficientStorageSnapshotDialogComponent {
  public textContent: any;
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<InsufficientStorageSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent =
      this._textContentProvider.content.servers.shared.insufficientStorageSnapshotDialog;
    this.dialogModel = this.dialogData as ServerSnapshotDialogContent[][0];
  }

  /**
   * Warning icon key
   */
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Alert message to be displayed in the dialog
   */
  public get alertMessage(): string {
    return replacePlaceholder(
      this.textContent.alert,
      'vdc_name',
      this.dialogModel.vdcName);
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('insufficient-snapshot-storage-close-click');
    this.dialogRef.close();
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'insufficient-snapshot-storage-dialog');
  }
}
