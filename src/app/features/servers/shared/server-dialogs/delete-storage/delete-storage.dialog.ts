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
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import { ServerStorageDevice } from '../../../models';

@Component({
  selector: 'mcs-delete-storage-dialog',
  templateUrl: './delete-storage.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-storage-dialog-wrapper'
  }
})

export class DeleteStorageDialogComponent {
  public textContent: any;
  public storage: ServerStorageDevice;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DeleteStorageDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: ServerStorageDevice
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteStorageDialog;
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
    return replacePlaceholder(
      this.textContent.title,
      'storage_name',
      this.storage.name
    );
  }

  /**
   * Display dialog alert message
   */
  public get dialogAlertMessage(): string {
    if (isNullOrEmpty(this.storage)) { return ''; }
    return replacePlaceholder(
      this.textContent.alert,
      'storage_name',
      this.storage.name
    );
  }
}
