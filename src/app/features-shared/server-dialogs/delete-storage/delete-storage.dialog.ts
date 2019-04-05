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
import { isNullOrEmpty } from '@app/utilities';
import { McsServerStorageDevice } from '@app/models';

@Component({
  selector: 'mcs-delete-storage-dialog',
  templateUrl: './delete-storage.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-storage-dialog-wrapper'
  }
})

export class DeleteStorageDialogComponent {
  public storage: McsServerStorageDevice;

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<DeleteStorageDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: McsServerStorageDevice
  ) {
    this.storage = this.dialogData;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
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
  public deleteStorage(): void {
    this.dialogRef.close(this.storage);
  }

  /**
   * Display dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.storage)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogDeleteStorage.title',
      { storage_name: this.storage.name }
    );
  }

  /**
   * Display dialog alert message
   */
  public get dialogAlertMessage(): string {
    if (isNullOrEmpty(this.storage)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogDeleteStorage.alert',
      { storage_name: this.storage.name }
    );
  }
}
