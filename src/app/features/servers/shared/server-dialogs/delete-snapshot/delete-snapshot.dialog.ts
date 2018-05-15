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
  selector: 'mcs-delete-snapshot-dialog',
  templateUrl: './delete-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-snapshot-dialog-wrapper'
  }
})

export class DeleteSnapshotDialogComponent {
  public textContent: any;
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<DeleteSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteSnapshotDialog;
    this.dialogModel = this.dialogData as ServerSnapshotDialogContent[][0];
  }

  /**
   * Warning icon key
   */
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Title text to be displayed in the dialog
   */
  public get titleText(): string {
    return replacePlaceholder(
      this.textContent.title,
      'snapshot_name',
      this.dialogModel.snapshotName);
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('delete-snapshot-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public deleteSnapshot(): void {
    this._sendEventTracking('delete-snapshot-confirm-click');
    this.dialogRef.close(true);
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'delete-snapshot-dialog');
  }
}
