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
import { ServerSnapshotDialogContent } from '../../../models';

@Component({
  selector: 'mcs-disk-conflict-snapshot-dialog',
  templateUrl: './disk-conflict-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'disk-conflict-snapshot-dialog-wrapper'
  }
})

export class DiskConflictSnapshotDialogComponent {
  public textContent: any;
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<DiskConflictSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent =
      this._textContentProvider.content.servers.shared.diskConflictSnapshotDialog;
    this.dialogModel = this.dialogData as ServerSnapshotDialogContent[][0];
  }

  /**
   * Warning icon key
   */
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('disk-conflict-snapshot-close-click');
    this.dialogRef.close();
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'disk-conflict-snapshot-dialog');
  }
}
