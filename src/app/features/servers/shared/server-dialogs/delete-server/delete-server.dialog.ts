import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider
} from '../../../../../core';
import { Server } from '../../../models';
import { replacePlaceholder } from '../../../../../utilities';

@Component({
  selector: 'mcs-delete-server-dialog',
  templateUrl: './delete-server.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-server-dialog-wrapper'
  }
})

export class DeleteServerDialogComponent {
  public textContent: any;
  public servers: Server[];

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<DeleteServerDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this._initialize();
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
  public deleteServer(): void {
    this.dialogRef.close(true);
  }

  public get dialogTitle(): string {
    let title = '';

    if (this.servers.length > 1) {
      title = this.textContent.title.multiple;
    } else {
      let serverName = (this.servers[0]) ? this.servers[0].managementName : '' ;
      title = replacePlaceholder(this.textContent.title.single, 'server_name', serverName);
    }

    return title;
  }

  public get dialogAlert(): string {
    return (this.servers.length > 1) ?
      this.textContent.alert.multiple :
      this.textContent.alert.single ;
  }

  private _initialize(): void {
    this.textContent = this._textContentProvider.content.servers.shared.deleteServerDialog;
    this.servers = new Array<Server>();

    if (this.dialogData instanceof Array) {
      this.servers = this.dialogData;
    } else {
      this.servers.push(this.dialogData);
    }
  }
}
