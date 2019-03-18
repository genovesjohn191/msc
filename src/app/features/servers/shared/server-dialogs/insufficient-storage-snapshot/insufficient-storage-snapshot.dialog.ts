import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition
} from '@app/core';
import { ServerSnapshotDialogContent } from '../../server-snapshot-dialog-content';

@Component({
  selector: 'mcs-insufficient-storage-snapshot-dialog',
  templateUrl: './insufficient-storage-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'insufficient-storage-snapshot-dialog-wrapper'
  }
})

export class InsufficientStorageSnapshotDialogComponent {
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<InsufficientStorageSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
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
    return this._translateService.instant(
      'serverShared.dialogInsufficientStorageSnapshot.alert',
      { vdc_name: this.dialogModel.vdcName }
    );
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
