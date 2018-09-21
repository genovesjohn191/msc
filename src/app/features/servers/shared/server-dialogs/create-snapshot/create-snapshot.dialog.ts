import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  CoreDefinition
} from '@app/core';
import { replacePlaceholder } from '@app/utilities';
import { ServerSnapshotDialogContent } from '../../server-snapshot-dialog-content';

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
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public createSnapshot(): void {
    this.dialogRef.close(true);
  }
}
