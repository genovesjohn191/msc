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
import {
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
import { McsServerNic } from '@app/models';

@Component({
  selector: 'mcs-delete-nic-dialog',
  templateUrl: './delete-nic.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-nic-dialog-wrapper'
  }
})

export class DeleteNicDialogComponent {
  public textContent: any;
  public nic: McsServerNic;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DeleteNicDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: McsServerNic
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteNicDialog;
    this.nic = this.dialogData;
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
  public deleteNic(): void {
    this.dialogRef.close(this.nic);
  }

  /**
   * Display dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.nic)) { return ''; }
    return replacePlaceholder(
      this.textContent.title,
      'nic_name',
      this.nic.name
    );
  }
}
