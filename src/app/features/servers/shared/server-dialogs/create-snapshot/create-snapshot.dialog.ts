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
  selector: 'mcs-create-snapshot-dialog',
  templateUrl: './create-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'create-snapshot-dialog-wrapper'
  }
})

export class CreateSnapshotDialogComponent {
  public textContent: any;
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<CreateSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent =
      this._textContentProvider.content.servers.shared.createSnapshotDialog;
    this.dialogModel = this.dialogData as ServerSnapshotDialogContent[][0];
  }

  /**
   * Warning icon key
   */
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Confirmation message to be displayed in the dialog
   */
  public get confirmationMessage(): string {
    return replacePlaceholder(
      this.textContent.confirmation,
      'server_name',
      this.dialogModel.serverName);
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('create-snapshot-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public createSnapshot(): void {
    this._sendEventTracking('create-snapshot-confirm-click');
    this.dialogRef.close(true);
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'create-snapshot-dialog');
  }
}
