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
import { ServerNetwork } from '../../../models';

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
  public network: ServerNetwork;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DeleteNicDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: ServerNetwork
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteNicDialog;
    this.network = this.dialogData;
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
    this.dialogRef.close(this.network);
  }

  /**
   * Display dialog title
   */
  public get dialogTitle(): string {
    if (isNullOrEmpty(this.network)) { return ''; }
    return replacePlaceholder(
      this.textContent.title,
      'network_name',
      this.network.name
    );
  }

  /**
   * Display dialog alert message
   */
  public get dialogAlert(): string {
    if (isNullOrEmpty(this.network)) { return ''; }
    return replacePlaceholder(
      this.textContent.alert,
      'network_name',
      this.network.name
    );
  }
}
