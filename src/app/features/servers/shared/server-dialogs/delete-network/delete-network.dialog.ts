import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import { ServerNetwork } from '../../../models';

@Component({
  selector: 'mcs-delete-network-dialog',
  templateUrl: './delete-network.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-network-dialog-wrapper'
  }
})

export class DeleteNetworkDialogComponent {
  public textContent: any;
  public network: ServerNetwork;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DeleteNetworkDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: ServerNetwork
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.deleteNetworkDialog;
    this.network = this.dialogData;
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
  public deleteNetwork(): void {
    this.dialogRef.close(this.network);
  }

  /**
   * Display dialog title
   */
  public displayDialogTitle(): string {
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
  public displayDialogAlertMessage(): string {
    if (isNullOrEmpty(this.network)) { return ''; }
    return replacePlaceholder(
      this.textContent.alert,
      'network_name',
      this.network.name
    );
  }
}
